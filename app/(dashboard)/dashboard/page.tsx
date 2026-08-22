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
import { eq, inArray, desc } from "drizzle-orm";
import { createSeed, agoStr, initials, TZS, type Product, type Service } from "@/lib/demo";
import { ensureUserRow } from "@/lib/ensureUser";

export const dynamic = "force-dynamic";

const TILE_TONES = [
  "bg-grn-bg text-grn-d",
  "bg-[#E2F0F7] text-[#22688A]",
  "bg-amb-bg text-amber-600",
  "bg-[#EFEAF7] text-[#6A4FC0]",
  "bg-red-bg text-red",
  "bg-[#0C2417] text-lime2",
];

function StatIcon({ name }: { name: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {name === "chat" && <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 20l1.1-4.9A8.4 8.4 0 1 1 21 11.5z" />}
      {name === "zap" && <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />}
      {name === "user" && <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" /></>}
      {name === "box" && <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 8.3L12 13l8.7-4.7M12 13v8" /></>}
      {name === "stock" && <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>}
      {name === "alert" && <><path d="M12 3L1.8 20h20.4L12 3z" /><path d="M12 10v4M12 17.5v.5" /></>}
      {name === "bot" && <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V5M9 5h6" /></>}
      {name === "hand" && <><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 12V4.5a1.5 1.5 0 0 1 3 0V12M14 12V6a1.5 1.5 0 0 1 3 0v7" /><path d="M17 13a4.5 4.5 0 0 1 4 4.5c0 3-2 6.5-7 6.5h-2c-3.5 0-5-2-7.5-6L3 15.2c-.7-1.2.8-2.6 2-1.7L8 16" /></>}
    </svg>
  );
}

function StatCard({
  icon,
  k,
  v,
  s,
  tone = 0,
  alert,
}: {
  icon: string;
  k: string;
  v: string;
  s: string;
  tone?: number;
  alert?: "warn" | "bad";
}) {
  return (
    <div
      className={`group bg-white border rounded-[16px] p-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-[3px] ${
        alert === "bad"
          ? "border-red-br hover:shadow-[0_14px_30px_-14px_rgba(199,67,67,.4)]"
          : alert === "warn"
            ? "border-amb-br hover:shadow-[0_14px_30px_-14px_rgba(185,119,8,.35)]"
            : "border-cborder hover:shadow-[0_14px_30px_-14px_rgba(20,154,91,.35)]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-grn to-lime2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[.07em] text-muted leading-tight">{k}</span>
        <span
          className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-none transition-transform group-hover:scale-105 ${
            alert === "bad" ? TILE_TONES[4] : alert === "warn" ? TILE_TONES[2] : TILE_TONES[tone % TILE_TONES.length]
          }`}
        >
          <StatIcon name={icon} />
        </span>
      </div>
      <div className="font-mono text-[25px] font-bold mt-2.5 tracking-[-.02em] text-dark leading-none">{v}</div>
      <div className="text-[11.5px] text-muted mt-1.5">{s}</div>
    </div>
  );
}

function BarsChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1) * 1.18;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bars = data.map((v, i) => {
    const bh = Math.max(6, Math.round((v / max) * 100));
    const today = i === data.length - 1;
    const d = new Date(Date.now() - (data.length - 1 - i) * 864e5);
    const label = i % 2 === 0 ? days[d.getDay()] + " " + d.getDate() : "";
    return (
      <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <div className="w-full flex items-end justify-center" style={{ height: 120 }}>
          <div
            className={`w-[78%] max-w-[26px] rounded-t-[6px] transition-all ${today ? "bg-gradient-to-t from-grn to-lime2 shadow-[0_6px_16px_-6px_rgba(20,154,91,.65)]" : "bg-[#D5EBDD] hover:bg-grn"}`}
            style={{ height: `${bh}%` }}
            title={`${v} messages · ${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}`}
          />
        </div>
        <span className="font-mono text-[8.5px] text-muted whitespace-nowrap hidden sm:block">{label}</span>
      </div>
    );
  });
  return <div className="flex items-end gap-1.5 h-[150px]">{bars}</div>;
}

function Donut({ a, b }: { a: number; b: number }) {
  const tot = a + b;
  const r = 44;
  const c = 2 * Math.PI * r;
  const pa = tot > 0 ? a / tot : 0;
  const pct = tot > 0 ? Math.round(pa * 100) : 0;
  return (
    <div className="flex items-center gap-5">
      <svg width="112" height="112" viewBox="0 0 116 116" className="flex-none">
        <circle cx="58" cy="58" r={r} fill="none" stroke="#E4EDE5" strokeWidth="15" />
        <circle cx="58" cy="58" r={r} fill="none" stroke="#149A5B" strokeWidth="15" strokeLinecap="round" strokeDasharray={`${c * pa} ${c}`} transform="rotate(-90 58 58)" />
        <circle cx="58" cy="58" r={r} fill="none" stroke="#E8A222" strokeWidth="15" strokeLinecap="round" strokeDasharray={`${c * (1 - pa)} ${c}`} strokeDashoffset={-c * pa} transform="rotate(-90 58 58)" />
        <text x="58" y="55" textAnchor="middle" style={{ font: "700 20px var(--mono)", fill: "#17291E" }}>{pct}%</text>
        <text x="58" y="71" textAnchor="middle" style={{ font: "600 9px var(--body)", fill: "#8B9B8F" }}>AUTO</text>
      </svg>
      <div className="text-[12.5px] flex flex-col gap-2">
        <span className="flex items-center gap-2"><i className="dot g" />AI resolved <b className="font-mono ml-auto pl-3">{a}</b></span>
        <span className="flex items-center gap-2"><i className="dot a" />Handed off <b className="font-mono ml-auto pl-3">{b}</b></span>
        <span className="text-[11.5px] text-muted">{pct}% fully automated</span>
      </div>
    </div>
  );
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

const FEED_TONES: Record<string, string> = {
  sale: "bg-grn-bg text-grn-d",
  stock: "bg-amb-bg text-amber-600",
  hand: "bg-red-bg text-red",
  chat: "bg-blu-bg text-blu",
  policy: "bg-[#EFEAF7] text-[#6A4FC0]",
  ai: "bg-grn-bg text-grn-d",
  sys: "bg-[#EEF2ED] text-[#5D7064]",
};

function FeedIcon({ type }: { type: string }) {
  const n = type === "sale" ? "tag" : type === "stock" ? "alert" : type === "hand" ? "hand" : type === "chat" ? "chat" : type === "policy" ? "book" : "bot";
  const paths: Record<string, React.ReactNode> = {
    tag: <><path d="M20.6 13.4L11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8z" /><circle cx="8" cy="8" r="1.4" /></>,
    alert: <><path d="M12 3L1.8 20h20.4L12 3z" /><path d="M12 10v4M12 17.5v.5" /></>,
    hand: <><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 12V4.5a1.5 1.5 0 0 1 3 0V12M14 12V6a1.5 1.5 0 0 1 3 0v7" /><path d="M17 13a4.5 4.5 0 0 1 4 4.5c0 3-2 6.5-7 6.5h-2c-3.5 0-5-2-7.5-6L3 15.2c-.7-1.2.8-2.6 2-1.7L8 16" /></>,
    chat: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 20l1.1-4.9A8.4 8.4 0 1 1 21 11.5z" />,
    book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />,
    bot: <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V5M9 5h6" /></>,
  };
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {paths[n]}
    </svg>
  );
}

type SaleRow = { productName: string; qty: number; unitPrice: number; amount: number; createdAt: Date };

function SalesList({ rows }: { rows: SaleRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-line2 bg-[#FBFDFB] px-4 py-6 text-center">
        <p className="text-[13px] text-muted">No sales recorded yet.</p>
        <p className="text-[12px] text-muted mt-1">When you mark a conversation as <b>&ldquo;sold&rdquo;</b> in your inbox, it shows up here with stock auto-deducted.</p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col">
      {rows.map((s, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5 border-b border-[#F1F5F0] last:border-0">
          <span className="w-9 h-9 rounded-[10px] bg-grn-bg text-grn-d flex items-center justify-center flex-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 13.4L11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8z" /><circle cx="8" cy="8" r="1.4" /></svg>
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-dark truncate">{s.productName}</div>
            <div className="text-[11px] text-muted font-mono">
              {s.qty} × {TZS(s.unitPrice)} · {agoStr(new Date(s.createdAt).getTime())}
            </div>
          </div>
          <b className="font-mono text-[13px] text-grn-d whitespace-nowrap">{TZS(s.amount)}</b>
        </li>
      ))}
    </ul>
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
  try {
    if (row) {
      const s = await db.select().from(settings).where(eq(settings.userId, row.id)).limit(1);
      if (s.length) {
        bizSettings = (s[0].business ?? null) as { name?: string; desc?: string; city?: string; phone?: string; owner?: string } | null;
        businessLogo = s[0].logo ?? null;
      }
    }
  } catch (e) {
    console.error("Dashboard business profile error:", e);
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

  const isDemoOwner = row?.isDemoOwner ?? false;

  let seed: ReturnType<typeof createSeed> | null = null;
  let real = { total: 0, today: 0, active: 0, waiting: 0, byDay: [] as number[] };
  let wa: typeof whatsappConnections.$inferSelect | undefined;
  let catalogProducts: Product[] | null = null;
  let catalogServices: Service[] | null = null;
  let hasPolicies = false;
  let threshold = 3;
  let recentSales: SaleRow[] = [];
  let aiResolved = 0;
  let handedOff = 0;

  try {
    if (isDemoOwner) {
      seed = createSeed();
    } else if (row) {
      const convs = await db
        .select({ id: conversations.id, status: conversations.status, outcome: conversations.outcome })
        .from(conversations)
        .where(eq(conversations.userId, row.id));
      const ids = convs.map((c) => c.id);
      const msgs = ids.length
        ? await db.select({ t: messages.createdAt }).from(messages).where(inArray(messages.conversationId, ids))
        : [];
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const dayCounts: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        dayCounts.push(msgs.filter((m) => m.t >= d && m.t < next).length);
      }
      real = {
        total: msgs.length,
        today: msgs.filter((m) => m.t >= startOfDay).length,
        active: convs.filter((c) => c.status !== "closed").length,
        waiting: convs.filter((c) => c.status === "waiting").length,
        byDay: dayCounts,
      };

      catalogProducts = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.userId, row.id))
        .orderBy(productsTable.sortOrder)
        .then((rs) =>
          rs.map((r) => ({
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
          }))
        );
      catalogServices = await db.select().from(servicesTable).where(eq(servicesTable.userId, row.id)).then((rs) =>
        rs.map((r) => ({
          id: r.id,
          name: r.name,
          desc: r.desc,
          price: r.price,
          from: r.priceFrom,
          dur: r.duration,
          booking: r.booking,
          warranty: r.warranty,
        }))
      );

      const pol = (await db.select().from(policiesTable).where(eq(policiesTable.userId, row.id)).limit(1))[0];
      if (pol) {
        threshold = pol.lowStockThreshold ?? 3;
        hasPolicies =
          (Array.isArray(pol.payments) && pol.payments.length > 0) ||
          (Array.isArray(pol.areas) && pol.areas.length > 0) ||
          (Array.isArray(pol.warranty) && pol.warranty.length > 0) ||
          !!pol.returns?.trim() ||
          !!pol.refunds?.trim() ||
          (Array.isArray(pol.custom) && pol.custom.length > 0);
      }

      recentSales = await db
        .select({
          productName: salesTable.productName,
          qty: salesTable.qty,
          unitPrice: salesTable.unitPrice,
          amount: salesTable.amount,
          createdAt: salesTable.createdAt,
        })
        .from(salesTable)
        .where(eq(salesTable.userId, row.id))
        .orderBy(desc(salesTable.createdAt))
        .limit(5);

      aiResolved = convs.filter((c) => c.outcome === "sold").length;
      handedOff = convs.filter((c) => c.status === "waiting").length;

      const waRes = await db.select().from(whatsappConnections).where(eq(whatsappConnections.userId, row.id)).limit(1);
      wa = waRes[0];
    }
  } catch (e) {
    console.error("Dashboard stats error:", e);
  }

  const demo = seed?.stats ?? null;
  const total = seed ? demo!.total : real.total;
  const today = seed ? demo!.today : real.today;
  const active = seed ? seed.conversations.filter((c) => c.status !== "closed").length : real.active;
  const waiting = seed ? seed.conversations.filter((c) => c.status === "waiting").length : real.waiting;
  const products = catalogProducts ?? (seed ? seed.products : null);
  const services = catalogServices ?? (seed ? seed.services : null);
  const productsN = products?.length ?? 0;
  const servicesN = services?.length ?? 0;
  const stock = products ? products.reduce((s, x) => s + x.stock, 0) : 0;
  const outN = products ? products.filter((x) => x.stock === 0).length : 0;
  const lowN = products ? products.filter((x) => x.stock > 0 && x.stock <= threshold).length : 0;
  if (seed) {
    aiResolved = demo!.aiResolved;
    handedOff = demo!.handedOff;
    recentSales = seed.salesToday.map((s) => ({
      productName: s.p,
      qty: 1,
      unitPrice: s.amt,
      amount: s.amt,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 36e5),
    }));
    hasPolicies = true;
  }
  const msgsByDay = seed ? seed.msgsByDay : real.byDay;
  const activity = seed ? seed.activity : [];
  const swPct = Math.round(((demo?.swMsgs ?? 0) / ((demo?.swMsgs ?? 0) + (demo?.enMsgs ?? 0))) * 100) || 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const checklist = [
    { label: "Finish setup wizard", done: onboarded, href: "/onboarding", cta: onboarded ? "Edit" : "Start" },
    { label: "Add your business name", done: hasBusinessName, href: "/settings", cta: "Add" },
    { label: "Add your first product", done: productsN > 0, href: "/dashboard/products", cta: "Add" },
    { label: "Write your policies", done: hasPolicies, href: "/dashboard/policies", cta: "Set up" },
    { label: "Connect WhatsApp", done: !!wa, href: "/settings", cta: "Connect" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((doneCount / checklist.length) * 100);
  const fullySetUp = onboarded && !!wa;

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
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-lime2 text-[#06170D] font-semibold text-sm hover:bg-[#6ff0a8] transition-colors"
          >
            Complete setup wizard
          </Link>
        </div>
      )}

      {!fullySetUp && (
        <div className="bg-[#0C2417] rounded-[20px] overflow-hidden mb-5 text-white relative shadow-[0_20px_50px_-24px_rgba(12,36,23,.55)]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 18%, rgba(83,232,155,.16) 0, transparent 40%), radial-gradient(circle at 90% 0%, rgba(20,154,91,.22) 0, transparent 45%), radial-gradient(rgba(143,240,180,.05) 1px, transparent 1px)",
              backgroundSize: "auto, auto, 26px 26px",
            }}
          />
          <div className="relative p-6 sm:p-7 flex items-center justify-between flex-wrap gap-5">
            <div className="min-w-0 flex items-center gap-4">
              {businessLogo ? (
                <span className="w-14 h-14 rounded-[16px] overflow-hidden flex-none ring-1 ring-white/20 bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={businessLogo} alt={displayName} className="w-full h-full object-cover" />
                </span>
              ) : (
                <span className="w-14 h-14 rounded-[16px] bg-lime2 text-[#06170D] flex items-center justify-center font-extrabold font-disp text-[20px] flex-none shadow-[0_8px_20px_-8px_rgba(83,232,155,.6)]">
                  {hasBusinessName ? initials(businessName) : "?"}
                </span>
              )}
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#8FF0B4] mb-1">Your AI storefront</div>
                <h2 className="font-disp text-[22px] font-bold leading-tight truncate">{displayName}</h2>
                <div className="text-[13px] text-[#9DB6A7] mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {description && <span className="truncate max-w-[420px]">{description}</span>}
                  {city && <span>{city}</span>}
                  {phone && <span className="font-mono">{phone}</span>}
                </div>
                {!hasBusinessName && (
                  <Link href="/settings" className="inline-flex items-center gap-1.5 mt-2 text-[12.5px] font-bold text-lime2 hover:underline">
                    Set up your business →
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link href="/dashboard/agent" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-grn text-white font-semibold text-sm hover:bg-grn-d transition-colors shadow-[0_8px_18px_-8px_rgba(20,154,91,.7)]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 20l1.1-4.9A8.4 8.4 0 1 1 21 11.5z" /></svg>
                Open Chat Agent
              </Link>
              <Link href="/dashboard/products" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/10">
                Manage catalog
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="statgrid">
        <StatCard icon="chat" k="Total messages" v={total.toLocaleString()} s={seed ? "all time" : "all time · via WhatsApp"} tone={0} />
        <StatCard icon="zap" k="Messages today" v={today.toLocaleString()} s="since midnight" tone={1} />
        <StatCard icon="user" k="Active conversations" v={String(active)} s={waiting ? waiting + " waiting for you" : "in your inbox"} tone={3} alert={waiting ? "warn" : undefined} />
        <StatCard icon="box" k="Total products" v={String(productsN)} s={servicesN ? servicesN + " services" : seed ? "in catalog" : "add your catalog"} tone={2} />
        <StatCard icon="stock" k="Items in stock" v={String(stock)} s={productsN ? "units across catalog" : "no stock tracked yet"} tone={5} />
        <StatCard icon="alert" k="Out of stock" v={String(outN)} s={lowN ? lowN + " running low" : productsN ? "all stocked" : "—"} tone={4} alert={outN ? "bad" : undefined} />
        <StatCard icon="bot" k="Closed as sold" v={aiResolved.toLocaleString()} s={seed ? "this month" : "marked sold in inbox"} tone={0} />
        <StatCard icon="hand" k="Waiting on you" v={handedOff.toLocaleString()} s={seed ? "this month" : "human handoffs"} tone={2} />
      </div>

      <div className="dashgrid">
        <div className="dcol">
          <div className="pcard">
            <h3>
              Messages per day
              <span className="badge b-grn">last 14 days</span>
            </h3>
            <BarsChart data={msgsByDay} />
          </div>

          <div className="pcard">
            <h3>
              Recent sales
              <span className="badge b-mut">latest {recentSales.length || 0}</span>
            </h3>
            <SalesList rows={recentSales.slice(0, 5)} />
          </div>

          <div className="pcard">
            <h3>
              Live activity
              <span className="livechip" style={{ fontSize: 11, padding: "3px 10px" }}>
                <span className="dot g" /> streaming
              </span>
            </h3>
            {activity.length ? (
              <ul className="feed">
                {activity.slice(0, 12).map((a, i) => (
                  <li key={i}>
                    <span className={`fi ${FEED_TONES[a.tone] || "fi.sys"}`}><FeedIcon type={a.type} /></span>
                    <div className="ft">
                      {a.txt}
                      <br />
                      <time>{agoStr(a.t)}</time>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty" style={{ padding: 22 }}>
                <p>No activity yet — your WhatsApp conversations will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="dcol">
          {!fullySetUp && (
            <div className="pcard !bg-[#0C2417] !border-[#0C2417] text-white relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-60"
                style={{ backgroundImage: "radial-gradient(circle at 85% 10%, rgba(83,232,155,.14) 0, transparent 45%)" }}
              />
              <div className="relative">
                <h3 className="!text-white">Setup checklist</h3>
                <div className="flex items-center gap-4 mb-4">
                  <ProgressRing pct={progressPct} />
                  <p className="text-[12.5px] text-[#9DB6A7] leading-snug">
                    {progressPct === 100 ? (
                      <>Everything is ready — your AI agent is fully armed. 🎉</>
                    ) : (
                      <><b className="text-white">{checklist.length - doneCount} step{checklist.length - doneCount === 1 ? "" : "s"} left</b> until your agent knows your whole business.</>
                    )}
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {checklist.map((c) => (
                    <li key={c.label}>
                      <Link
                        href={c.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[12.5px] font-semibold transition-colors ${
                          c.done ? "text-[#8FF0B4] hover:bg-white/5" : "text-white/85 hover:bg-white/10"
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-none ${
                            c.done ? "bg-lime2 text-[#06170D]" : "border border-white/30 text-transparent"
                          }`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                        <span className={c.done ? "line-through opacity-70" : ""}>{c.label}</span>
                        {!c.done && <span className="ml-auto text-[10.5px] font-bold uppercase tracking-wide text-lime2">{c.cta} →</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="pcard">
            <h3>AI vs human</h3>
            <Donut a={aiResolved} b={handedOff} />
          </div>

          {seed && (
            <div className="pcard">
              <h3>Language split</h3>
              <div className="splitbar">
                <i style={{ width: `${swPct}%`, background: "var(--grn)" }} />
                <i style={{ flex: 1, background: "#BBD4C4" }} />
              </div>
              <div className="legend" style={{ flexDirection: "row", gap: 16 }}>
                <span><i className="dot g" />Swahili <b>{swPct}%</b></span>
                <span><i className="dot" style={{ background: "#BBD4C4" }} />English <b>{100 - swPct}%</b></span>
              </div>
            </div>
          )}

          <div className="pcard">
            <h3>
              Stock alerts
              <span className={`badge ${outN + lowN ? "b-amb" : "b-grn"}`}>{outN + lowN} items</span>
            </h3>
            {!products?.length ? (
              <div className="empty" style={{ padding: 22 }}>
                <p>Your catalog is empty — add products and the AI will track stock automatically.</p>
                <Link href="/dashboard/products" className="btn ghost xs" style={{ marginTop: 12 }}>
                  Add products
                </Link>
              </div>
            ) : products.filter((p) => p.stock <= threshold).length === 0 ? (
              <div className="empty" style={{ padding: 22 }}>
                <p>🎉 Everything is healthy.</p>
              </div>
            ) : (
              products
                .filter((p) => p.stock <= threshold)
                .sort((a, b) => a.stock - b.stock)
                .map((p) => (
                  <div className="stockalert" key={p.id}>
                    <span className="th" style={{ background: p.cl }}>{p.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="nm">{p.name}</div>
                      <div className="st" style={{ color: p.stock === 0 ? "var(--red)" : "var(--amb)" }}>
                        {p.stock === 0 ? "OUT OF STOCK" : p.stock + " left · threshold " + threshold}
                      </div>
                    </div>
                    <Link href="/dashboard/products" className="btn ghost xs">Restock</Link>
                  </div>
                ))
            )}
          </div>

          <div className="pcard">
            <h3>Your business</h3>
            <div className="flex flex-col gap-0 text-[13px]">
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#E4EDE5]">
                <span className="text-[#8B9B8F]">Name</span>
                <b className="font-mono font-semibold text-[#17291E]" style={{ textAlign: "right" }}>{displayName}</b>
              </div>
              {city && (
                <div className="flex justify-between py-1.5 border-b border-dashed border-[#E4EDE5]">
                  <span className="text-[#8B9B8F]">City</span>
                  <b className="font-mono font-semibold">{city}</b>
                </div>
              )}
              {phone && (
                <div className="flex justify-between py-1.5 border-b border-dashed border-[#E4EDE5]">
                  <span className="text-[#8B9B8F]">Pay to</span>
                  <b className="font-mono font-semibold">{phone}</b>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#E4EDE5]">
                <span className="text-[#8B9B8F]">WhatsApp</span>
                {wa ? (
                  <b className="font-mono font-semibold text-grn-d" style={{ textAlign: "right" }}>
                    {wa.displayPhoneNumber}
                    {wa.businessName ? <span className="block text-[11px] text-[#8B9B8F] font-normal">{wa.businessName}</span> : null}
                  </b>
                ) : (
                  <b className="font-mono font-semibold text-amber-600">Not connected</b>
                )}
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-[#E4EDE5]">
                <span className="text-[#8B9B8F]">AI knowledge</span>
                <b className="font-mono font-semibold text-grn-d">Synced</b>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#8B9B8F]">Plan</span>
                <b className="font-mono font-semibold text-grn-d">Pro · $5/mo</b>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-grn text-white font-semibold text-sm hover:bg-grn-d transition-colors">
                {onboarded ? "Edit setup wizard" : "Start setup wizard"}
              </Link>
              <Link href="/settings" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-[#E4EDE5] text-dark font-semibold text-sm hover:border-grn transition-colors">
                {wa ? "Manage WhatsApp" : "Connect WhatsApp"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
