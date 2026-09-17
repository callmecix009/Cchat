import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  users,
  conversations,
  messages,
  whatsappConnections,
  settings,
  products as productsTable,
  services as servicesTable,
  policies as policiesTable,
  sales as salesTable,
} from "@/lib/db/schema";
import { eq, inArray, desc, gte, and } from "drizzle-orm";
import { initials, TZS, type Product, type Service } from "@/lib/demo";
import { ensureUserRow } from "@/lib/ensureUser";
import { Badge } from "@/components/ui/badge";
import { StatCards, ListRow, type StatItem } from "@/components/dashboard/stats";
import CollapsibleCard from "@/components/collapsible-card";
import ProductThumb from "@/components/product-thumb";
import {
  VolumeChart,
  HandlingBars,
  type VolumePoint,
  type HandlingBar,
} from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

type FlatMsg = {
  conversationId: string;
  fromCustomer: boolean;
  aiSent: boolean;
  content: string;
  t: Date;
};

type ConvoLite = {
  id: string;
  name: string;
  phone: string;
  status: string;
  outcome: string | null;
  createdAt: Date;
};

function dayKey(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isoDay(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function buildVolume(msgs: FlatMsg[], days: number): VolumePoint[] {
  const out: VolumePoint[] = [];
  const today = dayKey(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    out.push({
      date: isoDay(d),
      count: msgs.filter((m) => m.t >= d && m.t < next).length,
    });
  }
  return out;
}

function buildHandling(msgs: FlatMsg[], days: number): HandlingBar[] {
  const out: HandlingBar[] = [];
  const today = dayKey(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const replies = msgs.filter((m) => !m.fromCustomer && m.t >= d && m.t < next);
    out.push({
      day: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      ai: replies.filter((m) => m.aiSent).length,
      owner: replies.filter((m) => !m.aiSent).length,
    });
  }
  return out;
}

function pctDelta(cur: number, prev: number) {
  if (!prev && !cur) return { v: 0, has: false };
  if (!prev) return { v: 100, has: true };
  return { v: ((cur - prev) / prev) * 100, has: true };
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const done = Math.round(c * (pct / 100));
  return (
    <div className="relative w-[76px] h-[76px] flex-none">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#F1F1EF" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#111" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${done} ${c}`} transform="rotate(-90 38 38)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-[#111] text-[17px] leading-none">{pct}%</span>
        <span className="text-[8px] uppercase tracking-wider text-[#9B9B9B] font-bold">ready</span>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  let row: typeof users.$inferSelect | undefined;
  try {
    row = await ensureUserRow(userId);
  } catch (e) {
    console.error("DB error on dashboard:", e);
  }

  const name = row?.name || "Boss";
  const onboarded = row?.onboarded ?? false;
  const data = (row?.onboardingData as { answers?: Record<number, string | string[]> } | null)?.answers ?? {};

  let bizSettings: { name?: string; desc?: string; city?: string; phone?: string; owner?: string } | null = null;
  let businessLogo: string | null = null;

  const isDemoOwner = row?.isDemoOwner ?? false;

  let wa: typeof whatsappConnections.$inferSelect | undefined;
  let catalogProducts: Product[] = [];
  let threshold = 3;
  let flatMsgs: FlatMsg[] = [];
  let convos: ConvoLite[] = [];
  let saleEvents: { productName: string; qty: number; amount: number; t: Date }[] = [];

  try {
    if (row) {
      if (isDemoOwner) {
        try {
          const { ensureDemoSeeded } = await import("@/lib/seed-demo-persist");
          await ensureDemoSeeded(row.id);
        } catch (e) {
          console.error("Demo seeding from dashboard failed:", e);
        }
      }
      try {
        const { ensureProductImageColumn } = await import("@/lib/db/ensure-columns");
        await ensureProductImageColumn();
      } catch (e) {
        console.error("Ensure product image column failed:", e);
      }
      // Run all independent queries in parallel
      const [convRows, saleRows, productRows, polRes, waRes, s] = await Promise.all([
        db.select({
          id: conversations.id,
          contactName: conversations.contactName,
          contactPhone: conversations.contactPhone,
          status: conversations.status,
          outcome: conversations.outcome,
          createdAt: conversations.createdAt,
        }).from(conversations).where(eq(conversations.userId, row.id)),
        db.select().from(salesTable)
          .where(eq(salesTable.userId, row.id))
          .orderBy(desc(salesTable.createdAt))
          .limit(60),
        db.select().from(productsTable)
          .where(eq(productsTable.userId, row.id))
          .orderBy(productsTable.sortOrder),
        db.select().from(policiesTable).where(eq(policiesTable.userId, row.id)).limit(1),
        db.select().from(whatsappConnections).where(eq(whatsappConnections.userId, row.id)).limit(1),
        db.select().from(settings).where(eq(settings.userId, row.id)).limit(1),
      ]);

      convos = convRows.map((c) => ({
        id: c.id,
        name: c.contactName || c.contactPhone || "Customer",
        phone: c.contactPhone || "",
        status: c.status,
        outcome: c.outcome,
        createdAt: c.createdAt,
      }));

      saleEvents = saleRows.map((s) => ({
        productName: s.productName,
        qty: s.qty,
        amount: s.amount,
        t: s.createdAt,
      }));

      catalogProducts = productRows.map((r) => ({
        id: r.id,
        name: r.name,
        cat: r.cat,
        price: r.price,
        stock: r.stock,
        emoji: r.emoji,
        image: (r as { image?: string | null }).image ?? null,
        cl: r.color,
        kw: Array.isArray(r.keywords) ? r.keywords : [],
        sold: r.sold,
        hidden: r.hidden,
      }));

      const pol = polRes[0];
      if (pol) threshold = pol.lowStockThreshold ?? 3;
      wa = waRes[0];

      if (s.length) {
        bizSettings = (s[0].business ?? null) as { name?: string; desc?: string; city?: string; phone?: string; owner?: string } | null;
        businessLogo = s[0].logo ?? null;
      }

      // Messages query depends on conversations (needs ids)
      const ids = convRows.map((c) => c.id);
      const cutoff = dayKey(new Date());
      cutoff.setDate(cutoff.getDate() - 62);
      if (ids.length) {
        const msgRows = await db
          .select({
            conversationId: messages.conversationId,
            role: messages.role,
            aiHandled: messages.aiHandled,
            content: messages.content,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .where(and(inArray(messages.conversationId, ids), gte(messages.createdAt, cutoff)));
        flatMsgs = msgRows
          .filter((m) => m.createdAt >= cutoff)
          .map((m) => ({
            conversationId: m.conversationId,
            fromCustomer: m.role === "c",
            aiSent: !!m.aiHandled,
            content: m.content,
            t: m.createdAt,
          }));
      }
    }
  } catch (e) {
    console.error("Dashboard data error:", e);
  }

  const onboardName = (data[1] as string) || "";
  const businessName = bizSettings?.name?.trim() || onboardName || "";
  const hasBusinessName = !!businessName;
  const displayName = hasBusinessName ? businessName : "Set up your business";
  const description =
    bizSettings?.desc ||
    (data[2] as string) ||
    (hasBusinessName ? "I reply to your customers day and night." : "Add your shop name in Settings to start.");
  const city = bizSettings?.city || (data[3] as string) || "";
  const phone = bizSettings?.phone || (data[43] as string) || row?.phone || "";
  const owner = bizSettings?.owner || name.split(" ")[0] || "Boss";

  // ── aggregates ──
  const startToday = dayKey(new Date());
  const yest = new Date(startToday);
  yest.setDate(yest.getDate() - 1);
  const msgsToday = flatMsgs.filter((m) => m.t >= startToday).length;
  const msgsYesterday = flatMsgs.filter((m) => m.t >= yest && m.t < startToday).length;

  const active = convos.filter((c) => c.status !== "closed").length;
  const soldN = convos.filter((c) => c.outcome === "sold").length;

  const weekAgo = new Date(startToday);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(startToday);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const convosThisWeek = convos.filter((c) => c.createdAt >= weekAgo).length;
  const convosPrevWeek = convos.filter((c) => c.createdAt >= twoWeeksAgo && c.createdAt < weekAgo).length;

  const d30 = new Date(startToday);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(startToday);
  d60.setDate(d60.getDate() - 60);
  const salesRows30 = saleEvents.filter((s) => s.t >= d30);
  const salesPrev30 = saleEvents.filter((s) => s.t >= d60 && s.t < d30).length;
  const revenue30 = salesRows30.reduce((s, x) => s + x.amount, 0);
  const revenuePrev30 = saleEvents.filter((s) => s.t >= d60 && s.t < d30).reduce((s, x) => s + x.amount, 0);

  const volumeData = buildVolume(flatMsgs, 61);
  const handlingData = buildHandling(flatMsgs, 10);

  const stats: StatItem[] = [
    {
      label: "Messages today",
      value: msgsToday.toLocaleString(),
      delta: pctDelta(msgsToday, msgsYesterday).v,
      hasDelta: pctDelta(msgsToday, msgsYesterday).has && (msgsYesterday > 0 || msgsToday > 0),
      footnote: "vs yesterday",
    },
    {
      label: "Open chats",
      value: String(active),
      delta: pctDelta(convosThisWeek, convosPrevWeek).v,
      hasDelta: pctDelta(convosThisWeek, convosPrevWeek).has && (convosPrevWeek > 0 || convosThisWeek > 0),
      footnote: "new this week",
    },
    {
      label: "Sold",
      value: String(soldN),
      delta: pctDelta(salesRows30.length, salesPrev30).v,
      hasDelta: pctDelta(salesRows30.length, salesPrev30).has && (salesPrev30 > 0 || salesRows30.length > 0),
      footnote: "sales last 30d",
    },
    {
      label: "Money in (30 days)",
      value: TZS(revenue30),
      delta: pctDelta(revenue30, revenuePrev30).v,
      hasDelta: pctDelta(revenue30, revenuePrev30).has && (revenuePrev30 > 0 || revenue30 > 0),
      footnote: "from chats you marked sold",
    },
  ];

  const checklist = [
    { label: "Answer questions about your shop", done: onboarded, href: "/onboarding", cta: onboarded ? "Edit" : "Start" },
    { label: "Add your shop name", done: hasBusinessName, href: "/settings", cta: "Add" },
    { label: "Add what you sell", done: catalogProducts.length > 0, href: "/dashboard/products", cta: "Add" },
    { label: "Connect WhatsApp", done: !!wa, href: "/settings", cta: "Connect" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((doneCount / checklist.length) * 100);
  const fullySetUp = onboarded && !!wa;

  const lowStock = catalogProducts.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-[1280px] w-full transition-all duration-200">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="text-[24px] font-disp font-semibold tracking-tight text-[#111]">
            {greeting}, {owner}
          </h1>
          <p className="text-[13px] text-[#6B6B6B] mt-1">
            {displayName} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E9E9E7] text-[12px] font-medium text-[#111]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#149A5B]" /> Updated just now
        </span>
      </div>

      {!onboarded && (
        <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="w-9 h-9 rounded-[10px] bg-[#F7F7F5] border border-[#E9E9E7] text-[#111] grid place-items-center flex-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>
            </span>
            <div>
              <h3 className="font-disp text-[15px] font-semibold text-[#111]">Your helper isn&apos;t set up yet</h3>
              <p className="text-[13px] text-[#6B6B6B] mt-0.5">Answer 10 quick questions so it can sell and reply for you.</p>
            </div>
          </div>
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#111] text-white font-medium text-[13px] hover:bg-black transition-colors">
            Finish set-up
          </Link>
        </div>
      )}

      {!fullySetUp && (
        <div className="grid gap-6 sm:grid-cols-2 mb-6">
          <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-6">
            <h3 className="font-disp font-semibold text-[#111] text-[14px] mb-4">Set-up list</h3>
            <div className="flex items-center gap-4">
              <ProgressRing pct={progressPct} />
              <ul className="flex flex-col gap-1.5 min-w-0">
                {checklist.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className={`flex items-center gap-2 text-[13px] hover:underline ${c.done ? "text-[#9B9B9B] line-through" : "text-[#111]"}`}>
                      <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-none border ${c.done ? "bg-[#111] border-[#111] text-white" : "border-[#E9E9E7] text-transparent bg-white"}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border border-[#E9E9E7] rounded-[12px] p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              {businessLogo ? (
                <span className="w-10 h-10 rounded-[10px] overflow-hidden flex-none border border-[#E9E9E7] bg-white p-0.5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={businessLogo} alt={displayName} className="w-full h-full object-cover rounded-[8px]" />
                </span>
              ) : (
                <span className="w-10 h-10 rounded-[10px] bg-[#F7F7F5] border border-[#E9E9E7] text-[#6B6B6B] flex items-center justify-center font-semibold text-[14px] flex-none">
                  {hasBusinessName ? initials(businessName) : "?"}
                </span>
              )}
              <div className="min-w-0">
                <h3 className="font-disp font-semibold text-[#111] truncate text-[14px]">{displayName}</h3>
                <p className="text-[12px] text-[#6B6B6B] line-clamp-1">{description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/agent" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-[#149A5B] text-white font-medium text-[13px] hover:bg-[#0E7A47] transition-colors shadow-[0_2px_8px_rgba(20,154,91,.25)]">
                Test replies
              </Link>
              <Link href="/dashboard/products" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-white border border-[#E9E9E7] text-[#111] font-medium text-[13px] hover:bg-[#F7F7F5] transition-colors">
                Add goods
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* analytics — Notion breathing room */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCards items={stats} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 min-w-0">
          <VolumeChart data={volumeData} />
        </div>
        <div className="min-w-0">
          <HandlingBars data={handlingData} />
        </div>
      </div>

      <CollapsibleCard
        id="stock"
        title="Running out"
        desc={`${threshold} or less left — AI will warn you automatically.`}
        badge={<Badge variant={lowStock.length ? "amber" : "green"}>{lowStock.length} items</Badge>}
      >
        {!catalogProducts.length ? (
          <div className="py-10 text-center text-[#6B6B6B] text-[13px] px-5">
            No goods yet — add products and the AI tracks stock for you.
          </div>
        ) : lowStock.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#6B6B6B]">Everything is healthy.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-3 sm:p-4 bg-[#FCFCF9] dark:bg-[#0F0F0F]">
            {lowStock.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="group flex gap-3 p-3 rounded-[12px] bg-white dark:bg-[#1E1E1E] border border-[#E9E9E7] dark:border-[#2A2A2A] hover:border-[#111] dark:hover:border-[#EDEDED] hover:shadow-[0_2px_0_#111] dark:hover:shadow-none transition-all"
              >
                <div className="shrink-0">
                  <ProductThumb image={p.image} emoji={p.emoji} name={p.name} cl={p.cl} size={44} radius={10} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[13.5px] leading-tight text-dark line-clamp-1 truncate">{p.name}</div>
                  <div className="text-[11.5px] font-medium mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-flex w-1.5 h-1.5 rounded-full ${p.stock === 0 ? "bg-[#C74343]" : "bg-[#B97708]"}`} />
                    <span className={`${p.stock === 0 ? "text-[#C74343] dark:text-[#E85D5D]" : "text-[#B97708] dark:text-[#E8A222]"}`}>
                      {p.stock === 0 ? "Finished" : `${p.stock} left`}
                    </span>
                    <span className="text-muted">· {p.cat || "General"}</span>
                  </div>
                  <div className="mt-1.5">
                    {p.stock === 0 ? (
                      <Badge variant="red">Out</Badge>
                    ) : (
                      <Badge variant="amber">Low</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center border-t border-[#E9E9E7] dark:border-[#2A2A2A] py-2.5 bg-white dark:bg-[#1E1E1E]">
          <Link href="/dashboard/products" className="text-[12px] font-medium text-[#6B6B6B] hover:text-[#111] dark:hover:text-[#EDEDED] inline-flex items-center gap-1">
            Manage stock →
          </Link>
        </div>
      </CollapsibleCard>

      <CollapsibleCard
        id="shop"
        title="Your shop"
        desc={`${city ? `${city} · ` : ""}${phone ? `${phone} · ` : ""}${wa ? `WhatsApp ${wa.displayPhoneNumber}` : "WhatsApp not connected"}`}
        className="mt-6"
      >
        <div className="flex gap-2 flex-wrap p-5">
          <Link href="/onboarding" className="inline-flex items-center px-3.5 py-2 rounded-[8px] bg-[#111] text-white font-medium text-[13px] hover:bg-black transition-colors">
            {onboarded ? "Edit answers" : "Answer questions"}
          </Link>
          <Link href="/settings" className="inline-flex items-center px-3.5 py-2 rounded-[8px] border border-[#E9E9E7] bg-white text-[#111] font-medium text-[13px] hover:bg-[#F7F7F5] transition-colors">
            {wa ? "Open settings" : "Connect WhatsApp"}
          </Link>
        </div>
      </CollapsibleCard>
    </div>
  );
}
