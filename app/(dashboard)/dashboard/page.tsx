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
import { eq, inArray, desc, gte } from "drizzle-orm";
import { agoStr, initials, TZS, type Product, type Service } from "@/lib/demo";
import { ensureUserRow } from "@/lib/ensureUser";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCards, ListRow, type StatItem } from "@/components/dashboard/stats";
import {
  VolumeChart,
  OutcomeDonut,
  HandlingBars,
  type VolumePoint,
  type OutcomeSlice,
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
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#53E89B" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${done} ${c}`} transform="rotate(-90 38 38)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-white text-[17px] leading-none">{pct}%</span>
        <span className="text-[8px] uppercase tracking-wider text-[#8FF0B4] font-bold">ready</span>
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
          .limit(12),
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
          .where(inArray(messages.conversationId, ids));
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
    (hasBusinessName ? "Your AI WhatsApp agent is standing by." : "Add your business name in Business Profile to get started.");
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
  const waiting = convos.filter((c) => c.status === "waiting").length;
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

  const totalMsgs = flatMsgs.length;
  const aiReplies = flatMsgs.filter((m) => !m.fromCustomer && m.aiSent).length;
  const autoPct = totalMsgs ? Math.round((aiReplies / totalMsgs) * 100) : 0;

  const stats: StatItem[] = [
    {
      label: "Messages today",
      value: msgsToday.toLocaleString(),
      delta: pctDelta(msgsToday, msgsYesterday).v,
      hasDelta: pctDelta(msgsToday, msgsYesterday).has && (msgsYesterday > 0 || msgsToday > 0),
      footnote: "vs yesterday",
    },
    {
      label: "Active conversations",
      value: String(active),
      delta: pctDelta(convosThisWeek, convosPrevWeek).v,
      hasDelta: pctDelta(convosThisWeek, convosPrevWeek).has && (convosPrevWeek > 0 || convosThisWeek > 0),
      footnote: "new this week",
    },
    {
      label: "Closed as sold",
      value: String(soldN),
      delta: pctDelta(salesRows30.length, salesPrev30).v,
      hasDelta: pctDelta(salesRows30.length, salesPrev30).has && (salesPrev30 > 0 || salesRows30.length > 0),
      footnote: "sales last 30d",
    },
    {
      label: "Sales · 30 days",
      value: TZS(revenue30),
      delta: pctDelta(revenue30, revenuePrev30).v,
      hasDelta: pctDelta(revenue30, revenuePrev30).has && (revenuePrev30 > 0 || revenue30 > 0),
      footnote: "recorded via inbox",
    },
  ];

  const outcomeSlices: OutcomeSlice[] = [
    { key: "sold", label: "Closed as sold", value: soldN, color: "#149A5B" },
    { key: "waiting", label: "Waiting on you", value: waiting, color: "#E8A222" },
    {
      key: "open",
      label: "AI handling",
      value: convos.filter((c) => c.status !== "closed" && c.status !== "waiting").length,
      color: "#53E89B",
    },
    {
      key: "closed",
      label: "Closed other",
      value: convos.filter((c) => c.status === "closed" && c.outcome !== "sold").length,
      color: "#CFE0D4",
    },
  ].filter((s) => s.value > 0);

  // recent conversations table rows
  const lastMsgByConvo = new Map<string, FlatMsg>();
  for (const m of flatMsgs) {
    const prev = lastMsgByConvo.get(m.conversationId);
    if (!prev || m.t > prev.t) lastMsgByConvo.set(m.conversationId, m);
  }
  const recentRows = convos
    .map((c) => ({ c, lm: lastMsgByConvo.get(c.id) }))
    .sort((a, b) => (b.lm?.t.getTime() ?? b.c.createdAt.getTime()) - (a.lm?.t.getTime() ?? a.c.createdAt.getTime()))
    .slice(0, 5);

  function statusBadge(status: string, outcome: string | null) {
    if (outcome === "sold") return <Badge variant="green">Sold ✓</Badge>;
    if (status === "waiting") return <Badge variant="red">Needs you</Badge>;
    if (status === "closed") return <Badge variant="outline">Closed</Badge>;
    return <Badge variant="gray">AI live</Badge>;
  }

  // live activity feed from real signals
  type FeedItem = { kind: "sale" | "handoff"; title: React.ReactNode; sub: string };
  const feed: FeedItem[] = [];
  for (const s of saleEvents.slice(0, 5)) {
    feed.push({
      kind: "sale",
      title: (
        <>
          Sold <b>{s.qty}×</b> {s.productName}
        </>
      ),
      sub: `${TZS(s.amount)} · ${agoStr(s.t.getTime())}`,
    });
  }
  for (const c of convos.filter((x) => x.status === "waiting").slice(0, 4)) {
    feed.push({
      kind: "handoff",
      title: (
        <>
          Handed to you — <b>{c.name}</b>
        </>
      ),
      sub: "AI paused, waiting for your reply",
    });
  }

  const checklist = [
    { label: "Complete the Setup Guide", done: onboarded, href: "/onboarding", cta: onboarded ? "Edit" : "Start" },
    { label: "Add your business name", done: hasBusinessName, href: "/settings", cta: "Add" },
    { label: "Add your first product", done: catalogProducts.length > 0, href: "/dashboard/products", cta: "Add" },
    { label: "Connect WhatsApp", done: !!wa, href: "/settings", cta: "Connect" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((doneCount / checklist.length) * 100);
  const fullySetUp = onboarded && !!wa;

  const lowStock = catalogProducts.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="viewwrap max-w-[1240px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-[26px] font-disp font-bold tracking-tight text-dark">
            {greeting}, {owner}
          </h1>
          <p className="text-sm text-muted">
            {displayName} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <span className="livechip">
          <span className="dot g pulse" /> LIVE — updating in real time
        </span>
      </div>

      {!onboarded && (
        <div className="bg-[#0C2417] text-white rounded-[18px] p-6 mb-5 flex items-center justify-between flex-wrap gap-4 shadow-[0_20px_50px_-24px_rgba(12,36,23,.7)]">
          <div className="flex items-center gap-4">
            <span className="w-11 h-11 rounded-[14px] bg-lime2 text-[#06170D] flex items-center justify-center flex-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" /></svg>
            </span>
            <div>
              <h3 className="font-disp text-lg font-bold">Your AI agent isn&apos;t set up yet</h3>
              <p className="text-sm text-[#9DB6A7] mt-0.5">Answer 10 quick questions so your agent can sell, book and reply in your voice.</p>
            </div>
          </div>
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-lime2 text-[#06170D] font-semibold text-sm hover:bg-[#6ff0a8] transition-colors">
            Finish Setup
          </Link>
        </div>
      )}

      {!fullySetUp && (
        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          <div className="bg-[#0C2417] rounded-[16px] p-5 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 85% 10%, rgba(83,232,155,.14) 0, transparent 45%)" }} />
            <div className="relative">
              <h3 className="font-disp font-bold text-white text-[15.5px] mb-3">Setup checklist</h3>
              <div className="flex items-center gap-4">
                <ProgressRing pct={progressPct} />
                <ul className="flex flex-col gap-1 min-w-0">
                  {checklist.map((c) => (
                    <li key={c.label}>
                      <Link href={c.href} className={`flex items-center gap-2 text-[12px] font-semibold hover:underline ${c.done ? "text-[#8FF0B4] line-through opacity-80" : "text-white/90"}`}>
                        <span className={`w-[15px] h-[15px] rounded-full flex items-center justify-center flex-none ${c.done ? "bg-lime2 text-[#06170D]" : "border border-white/40 text-transparent"}`}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#0C2417] rounded-[16px] p-5 text-white relative overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 10% 18%, rgba(83,232,155,.16) 0, transparent 40%), radial-gradient(circle at 90% 0%, rgba(20,154,91,.22) 0, transparent 45%)" }} />
            <div className="relative flex flex-col justify-between h-full gap-4">
              <div className="flex items-center gap-3">
                {businessLogo ? (
                  <span className="w-12 h-12 rounded-[14px] overflow-hidden flex-none ring-1 ring-white/20 bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={businessLogo} alt={displayName} className="w-full h-full object-cover" />
                  </span>
                ) : (
                  <span className="w-12 h-12 rounded-[14px] bg-lime2 text-[#06170D] flex items-center justify-center font-extrabold font-disp text-[17px] flex-none">
                    {hasBusinessName ? initials(businessName) : "?"}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-disp font-bold truncate">{displayName}</h3>
                  <p className="text-[12px] text-[#9DB6A7] line-clamp-1">{description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/agent" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[9px] bg-grn text-white font-semibold text-[13px] hover:bg-grn-d transition-colors">
                  Open Chat Agent
                </Link>
                <Link href="/dashboard/products" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[9px] bg-white/10 border border-white/10 text-white font-semibold text-[13px] hover:bg-white/20 transition-colors">
                  Manage catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── analytics grid (dashboard-3 layout, C-chat palette) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCards items={stats} />

        <VolumeChart data={volumeData} />

        {outcomeSlices.length ? (
          <OutcomeDonut slices={outcomeSlices} automatedPct={autoPct} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Outcome split</CardTitle>
              <CardDescription>All conversations by result.</CardDescription>
            </CardHeader>
            <CardContent className="my-auto py-10 text-center text-muted text-[13px]">
              No conversations yet — connect WhatsApp and they&apos;ll appear here.
            </CardContent>
          </Card>
        )}

        <HandlingBars data={handlingData} />

        <Card className="md:col-span-2 gap-0">
          <CardHeader className="border-b border-[#E4EDE5] pb-3">
            <CardTitle>Recent conversations</CardTitle>
            <CardDescription>Latest threads from your inbox.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentRows.length ? (
              <ul className="divide-y divide-[#F1F5F0]">
                {recentRows.map(({ c, lm }) => (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFCFA] transition-colors">
                    <span className="w-8 h-8 rounded-full bg-grn-bg text-grn-d font-bold text-[11px] flex items-center justify-center flex-none">
                      {initials(c.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-dark leading-snug">{c.name}</p>
                      <p className="line-clamp-1 text-[11.5px] text-muted">
                        {lm ? (lm.fromCustomer ? "" : "You: ") + lm.content : "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-none">
                      {statusBadge(c.status, c.outcome)}
                      <span className="text-[10.5px] text-muted font-mono">{agoStr((lm?.t ?? c.createdAt).getTime())}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center text-muted text-[13px]">No conversations yet.</div>
            )}
            <div className="flex justify-center border-t border-[#E4EDE5] py-2.5">
              <Link href="/dashboard/inbox" className="text-[12.5px] font-bold text-grn-d hover:underline inline-flex items-center gap-1">
                View all conversations →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="border-b border-[#E4EDE5] pb-3">
            <CardTitle>Live activity</CardTitle>
            <CardDescription>Sales & handoffs.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {feed.length ? (
              <ul className="flex flex-col divide-y divide-[#F1F5F0] max-h-[300px] overflow-auto">
                {feed.slice(0, 8).map((f, i) => (
                  <ListRow
                    key={i}
                    dotColor={f.kind === "sale" ? "#149A5B" : "#E8A222"}
                    title={f.title}
                    sub={f.sub}
                  />
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center text-muted text-[13px] px-5">
                Nothing yet — sales and handoff alerts land here in real time.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="border-b border-[#E4EDE5] pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Stock alerts</CardTitle>
              <Badge variant={lowStock.length ? "amber" : "green"}>{lowStock.length} items</Badge>
            </div>
            <CardDescription>At or below {threshold} units.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!catalogProducts.length ? (
              <div className="py-10 text-center text-muted text-[13px] px-5">
                Catalog is empty — add products and the AI tracks stock automatically.
              </div>
            ) : lowStock.length === 0 ? (
              <div className="py-10 text-center text-[13px] text-grn-d font-semibold">Everything is healthy.</div>
            ) : (
              <ul className="flex flex-col divide-y divide-[#F1F5F0]">
                {lowStock.slice(0, 6).map((p) => (
                  <ListRow
                    key={p.id}
                    dot={
                      <span className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px] flex-none" style={{ background: p.cl }}>
                        {p.emoji}
                      </span>
                    }
                    dotColor="transparent"
                    title={p.name}
                    sub={p.stock === 0 ? "OUT OF STOCK" : `${p.stock} left`}
                    right={
                      p.stock === 0 ? (
                        <Badge variant="red">Out</Badge>
                      ) : (
                        <Badge variant="amber">Low</Badge>
                      )
                    }
                  />
                ))}
              </ul>
            )}
            <div className="flex justify-center border-t border-[#E4EDE5] py-2.5">
              <Link href="/dashboard/products" className="text-[12.5px] font-bold text-grn-d hover:underline inline-flex items-center gap-1">
                Manage catalog →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Your business</CardTitle>
            <CardDescription>
              {city ? `${city} · ` : ""}
              {phone ? `${phone} · ` : ""}
              {wa ? `WhatsApp ${wa.displayPhoneNumber}` : "WhatsApp not connected"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/onboarding" className="inline-flex items-center px-3.5 py-2 rounded-[9px] bg-grn text-white font-semibold text-[13px] hover:bg-grn-d transition-colors">
              {onboarded ? "Edit Setup Guide" : "Start Setup Guide"}
            </Link>
            <Link href="/settings" className="inline-flex items-center px-3.5 py-2 rounded-[9px] border border-[#E4EDE5] text-dark font-semibold text-[13px] hover:border-grn transition-colors">
              {wa ? "Manage WhatsApp" : "Connect WhatsApp"}
            </Link>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
