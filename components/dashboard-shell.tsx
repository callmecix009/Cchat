"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { initials } from "@/lib/demo";
import CchatLogo from "@/components/branding/CchatLogo";
import { GoldCrown, planBadgeInfo, type PlanState } from "@/components/premium";


const NAV = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "grid" },
  { id: "agent", label: "Chat Agent", href: "/dashboard/agent", icon: "bot" },
  { id: "inbox", label: "Inbox", href: "/dashboard/inbox", icon: "chat" },
  { id: "products", label: "Products", href: "/dashboard/products", icon: "box" },
  { id: "services", label: "Services", href: "/dashboard/services", icon: "wrench" },
  { id: "policies", label: "Policies", href: "/dashboard/policies", icon: "shield" },
  { id: "ai", label: "AI Configure", href: "/dashboard/ai", icon: "sliders" },
  { id: "settings", label: "Settings", href: "/settings", icon: "gear" },
  { id: "billing", label: "Billing", href: "/billing", icon: "card" },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  bot: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 4v4" /><circle cx="9" cy="13" r="1.2" /><circle cx="15" cy="13" r="1.2" />
    </svg>
  ),
  chat: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  box: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" />
    </svg>
  ),
  wrench: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2.4-2.4 3-3z" />
    </svg>
  ),
  shield: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  sliders: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  gear: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  card: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
};

type BizSettings = {
  business: {
    name?: string;
    desc?: string;
    city?: string;
    phone?: string;
    owner?: string;
    connected?: boolean;
  } | null;
  logo: string | null;
  avatar: string | null;
  whatsappConnected: boolean;
  whatsappPaused: boolean;
  planStatus: string;
  plan: string | null;
  trialEndsAt: string | null;
  expiresAt: string | null;
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();
  const [settings, setSettings] = useState<BizSettings | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const data = await res.json();
      setSettings({
        business: data.business ?? null,
        logo: data.logo ?? null,
        avatar: data.avatar ?? null,
        whatsappConnected: !!data.whatsappConnected,
        whatsappPaused: !!data.whatsappPaused,
        planStatus: data.planStatus ?? "inactive",
        plan: data.plan ?? null,
        trialEndsAt: data.trialEndsAt ?? null,
        expiresAt: data.expiresAt ?? null,
      });
    } catch {
      /* keep last known state */
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("seechat:business-updated", load);
    return () => window.removeEventListener("seechat:business-updated", load);
  }, [load]);

  // Check subscription access - non-blocking, redirects only when clearly expired/inactive
  useEffect(() => {
    let mounted = true;
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/billing");
        if (!res.ok) {
          if (mounted) setAccessChecked(true);
          return;
        }
        const data = await res.json();
        const isBlocked = data && (data.status === "expired" || data.status === "inactive" || data.status === "canceled");
        if (mounted && isBlocked) {
          const currentPath = window.location.pathname;
          const allowed = ["/plan-selection", "/settings", "/onboarding", "/billing", "/privacy", "/terms", "/acceptable-use"];
          const isAllowed = allowed.some((p) => currentPath.startsWith(p));
          if (!isAllowed) {
            router.push("/plan-selection");
            return;
          }
        }
      } catch {
        // Ignore errors - allow access on failure
      } finally {
        if (mounted) setAccessChecked(true);
      }
    };
    checkAccess();
    return () => {
      mounted = false;
    };
  }, [router]);

  // ---- Global pop-up notifications ----
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; msg: string; tone: "info" | "warn" | "err" }>>([]);
  const prevInboxRef = useRef<Map<string, number>>(new Map());
  const seenLowStockRef = useRef<Set<string>>(new Set());
  const isFirstInboxPoll = useRef(true);

  const pushToast = useCallback((title: string, msg: string, tone: "info" | "warn" | "err" = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, title, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  useEffect(() => {
    if (!accessChecked) return;
    let timer: ReturnType<typeof setInterval>;
    let stopped = false;

    const poll = async () => {
      try {
        // 1) Inbox: new customer messages (even when AI is handling)
        const inboxRes = await fetch("/api/inbox").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const convos: Array<any> = inboxRes?.conversations ?? [];
        if (!stopped && convos.length) {
          const now = Date.now();
          for (const c of convos) {
            const msgs: any[] = c.msgs ?? [];
            if (!msgs.length) continue;
            const last = msgs[msgs.length - 1];
            // Only notify for customer messages received in last 90s and not yet seen
            if (last.from === "c" && now - last.t < 90_000) {
              const prevT = prevInboxRef.current.get(c.id) ?? 0;
              if (!isFirstInboxPoll.current && last.t > prevT) {
                pushToast(`New message from ${c.name}`, (last.text || "").slice(0, 80), "info");
              }
              prevInboxRef.current.set(c.id, last.t);
            } else if (last.t) {
              // Keep track of latest t even for non-customer to avoid re-notifying
              const prevT = prevInboxRef.current.get(c.id) ?? 0;
              if (last.t > prevT) prevInboxRef.current.set(c.id, last.t);
            }
            // Handoff needs human
            if (c.status === "waiting" && c.reason && !isFirstInboxPoll.current) {
              // Only once per conversation per session
              const key = `handoff-${c.id}`;
              if (!seenLowStockRef.current.has(key)) {
                seenLowStockRef.current.add(key);
                pushToast(`Handoff: ${c.name} needs you`, c.reason.slice(0, 80), "warn");
              }
            }
          }
          isFirstInboxPoll.current = false;
        }

        // 2) Out of stock / low stock
        const ws = await fetch("/api/workspace").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (!stopped && ws?.products?.length) {
          const threshold = ws.lowStockThreshold ?? ws.policies?.lowStockThreshold ?? 3;
          for (const p of ws.products as Array<any>) {
            if (p.stock === 0 && !p.hidden) {
              const key = `oos-${p.id}`;
              if (!seenLowStockRef.current.has(key)) {
                seenLowStockRef.current.add(key);
                pushToast(`Out of stock: ${p.name}`, `Stock is 0 — AI will offer alternatives or notify list.`, "err");
              }
            } else if (p.stock > 0 && p.stock <= threshold && !p.hidden) {
              const key = `low-${p.id}-${p.stock}`;
              if (!seenLowStockRef.current.has(key)) {
                seenLowStockRef.current.add(key);
                pushToast(`Low stock: ${p.name}`, `Only ${p.stock} left — restock soon.`, "warn");
              }
            }
          }
        }
      } catch {}
    };

    // Initial poll after 4s, then every 15s
    const initial = setTimeout(poll, 4000);
    timer = setInterval(poll, 15000);
    return () => {
      stopped = true;
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [accessChecked, pushToast]);

  // While checking, still show shell but with subtle loading - don't block entire app with spinner
  // Only block if we haven't checked yet and no settings loaded
  if (!accessChecked && !settings) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted text-sm">Loading Cchat...</p>
        </div>
      </div>
    );
  }

  const businessName = settings?.business?.name?.trim() || "";
  const logo = settings?.logo || null;
  const hasIdentity = !!businessName;
  const waConnected = settings?.whatsappConnected ?? false;
  const waPaused = settings?.whatsappPaused ?? false;
  const trialEndsAt = settings?.trialEndsAt ? new Date(settings.trialEndsAt) : null;
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000)) : 0;
  const isTrialing = settings?.planStatus === "trialing" && trialDaysLeft > 0;
  const [inboxUnread, setInboxUnread] = useState(0);

  // Poll inbox for unread badge (scoped to business)
  useEffect(() => {
    if (!accessChecked) return;
    let stopped = false;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/inbox").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const convos: any[] = res?.conversations ?? [];
        const total = convos.reduce((s, c) => s + (c.unreadCount || 0), 0);
        if (!stopped) setInboxUnread(total);
      } catch {}
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 15000);
    // Also update when inbox read event fires
    const onRead = () => fetchUnread();
    window.addEventListener("inbox:read", onRead);
    return () => {
      stopped = true;
      clearInterval(id);
      window.removeEventListener("inbox:read", onRead);
    };
  }, [accessChecked]);

  const fallback = hasIdentity ? "AI live" : "Add your business name";
  const subline = !hasIdentity
    ? "Set up your business profile"
    : waConnected && !waPaused
      ? "WhatsApp connected · AI live"
      : waConnected && waPaused
        ? "WhatsApp paused · AI live"
        : "Connect WhatsApp · AI live";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[998] md:hidden bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* sidebar */}
      <aside className={`w-[236px] flex-none flex flex-col bg-[#0C2417] text-[#C9DCCE] fixed inset-y-0 left-0 z-[999] transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Link href="/" className="flex items-center gap-2.5 px-5 pt-5 pb-3.5 text-white font-disp font-extrabold text-lg">
          <CchatLogo size={32} decorative className="shrink-0" />
          Cchat
        </Link>
        <nav className="flex-1 overflow-auto px-2.5 py-1.5 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold text-[#A9C2B0] hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="opacity-90">{ICONS[n.icon]}</span>
              <span className="flex-1">{n.label}</span>
              {n.id === "inbox" && inboxUnread > 0 && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-extrabold leading-none">
                  {inboxUnread > 99 ? "99+" : inboxUnread}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3.5 m-2.5 mt-auto rounded-xl bg-white/5 text-xs">
          {(() => {
            const info = planBadgeInfo({
              status: settings?.planStatus ?? "inactive",
              plan: settings?.plan ?? null,
              trialEndsAt: settings?.trialEndsAt ?? null,
              expiresAt: settings?.expiresAt ?? null,
            });
            const tone =
              info.tone === "premium" || info.tone === "extra"
                ? "bg-lime2 text-[#06170D]"
                : info.tone === "trial"
                  ? "bg-[rgba(232,162,34,.15)] text-[#F5C563] border border-[rgba(232,162,34,.35)]"
                  : "bg-white/10 text-white";
            return (
              <Link href="/billing" className="block group">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] font-bold transition-transform group-hover:scale-[1.02] ${tone}`}>
                  {info.crown && <GoldCrown size={16} />}
                  <span>{info.label}</span>
                  <span className="ml-auto opacity-60">›</span>
                </div>
                <div className="text-[#86A893] mt-2 px-1">
                  {info.tone === "none"
                    ? "12,000 TSh/mo · 3-day free trial"
                    : info.tone === "trial"
                      ? "Full access while you try Cchat"
                      : info.tone === "extra"
                        ? "Yearly plan · thanks for the support "
                        : "Monthly plan · thanks for the support "}
                </div>
              </Link>
            );
          })()}
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {isTrialing && trialEndsAt && (
          <div className="flex-none bg-[#FEF9E7] border-b border-amber-200 px-3 sm:px-5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-[13px] sm:text-sm leading-[1.4]">
            <span className="flex items-center gap-2 font-medium text-amber-800 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="truncate sm:whitespace-normal">Free trial: <b>{trialDaysLeft}d</b> left — ends {trialEndsAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            </span>
            <Link href="/billing" className="self-start sm:self-auto inline-flex items-center justify-center text-xs font-bold px-3.5 py-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors whitespace-nowrap shrink-0">View plans</Link>
          </div>
        )}
        <header className="h-[62px] flex-none bg-white border-b border-cborder flex items-center gap-2 sm:gap-3.5 px-3 sm:px-5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex-none text-dark p-1 -ml-1"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/settings" className="flex items-center gap-2.5 min-w-0 group">
            {logo ? (
              <span className="w-9 h-9 rounded-[10px] overflow-hidden flex-none ring-1 ring-cborder bg-white flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={businessName || "Business logo"} className="w-full h-full object-contain" />
              </span>
            ) : (
              <span className="w-9 h-9 rounded-[10px] bg-dark text-lime2 flex items-center justify-center font-extrabold font-disp flex-none">
                {hasIdentity ? initials(businessName) : "?"}
              </span>
            )}
            <span className="min-w-0 block">
              <span className="font-bold text-sm truncate block group-hover:underline">
                {hasIdentity ? businessName : "Set up your business"}
              </span>
              <span className="text-[11.5px] text-muted font-mono truncate block">{subline}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
            {waConnected && !waPaused ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-grn-bg text-grn-d border border-grn-br whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-grn animate-pulse" />
                  WhatsApp Connected
                </span>
                <span className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-grn-bg text-grn-d border border-grn-br">
                  <span className="w-2 h-2 rounded-full bg-grn animate-pulse" />
                </span>
              </>
            ) : waConnected && waPaused ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amb-bg text-amber-600 border border-amb-br whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  WhatsApp Paused
                </span>
                <span className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-amb-bg text-amber-600 border border-amb-br">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </span>
              </>
            ) : (
              <Link
                href="/settings"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EEF2ED] text-[#5D7064] border border-[#DFE7DF] hover:border-grn hover:text-grn-d transition-colors whitespace-nowrap"
              >
                Connect WhatsApp
              </Link>
            )}
            {settings?.avatar ? (
              <Link href="/settings" title="Edit profile" className="flex-none hidden sm:block">
                <span className="w-9 h-9 rounded-[10px] overflow-hidden ring-1 ring-cborder inline-block hover:ring-grn transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.avatar} alt={user?.firstName || "Profile"} className="w-full h-full object-cover" />
                </span>
              </Link>
            ) : null}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-[10px]",
                  userButtonPopoverCard: "mx-2 sm:mx-0 w-[calc(100vw-16px)] sm:w-[360px] max-w-[360px]",
                  userButtonPopoverActionButton: "py-2.5",
                },
              }}
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-3 sm:p-6">{children}</main>
      </div>

      {/* Global pop-up toasts */}
      <div className="fixed top-3 right-2 sm:right-4 z-[5000] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-16px)] sm:max-w-[380px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.tone === "warn" ? "warn" : t.tone === "err" ? "err" : ""} pointer-events-auto flex`}
            style={{ animation: "tin .28s cubic-bezier(.2,.9,.3,1.1)" }}
          >
            <span className="ti mt-0.5">
              {t.tone === "err" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              ) : t.tone === "warn" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              )}
            </span>
            <div className="min-w-0">
              <b className="block text-[13px] leading-[1.3] truncate">{t.title}</b>
              <span className="block text-[12.5px] opacity-85 leading-[1.4] line-clamp-2">{t.msg}</span>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="ml-auto -mr-1 p-1 opacity-60 hover:opacity-100 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}