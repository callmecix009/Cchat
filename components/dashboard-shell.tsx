"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { initials } from "@/lib/demo";
import CchatLogo from "@/components/branding/CchatLogo";
import { Icon } from "@/components/icons";
import { GoldCrown, planBadgeInfo, type PlanState } from "@/components/premium";


const NAV = [
  { id: "dashboard", label: "Home", href: "/dashboard", icon: "grid" },
  { id: "agent", label: "Test replies", href: "/dashboard/agent", icon: "bot" },
  { id: "inbox", label: "Chats", href: "/dashboard/inbox", icon: "chat" },
  { id: "products", label: "Products", href: "/dashboard/products", icon: "box" },
  { id: "services", label: "Services", href: "/dashboard/services", icon: "wrench" },
  { id: "policies", label: "Shop rules", href: "/dashboard/policies", icon: "shield" },
  { id: "ai", label: "AI behaviour", href: "/dashboard/ai", icon: "sliders" },
  { id: "settings", label: "Settings", href: "/settings", icon: "gear" },
  { id: "billing", label: "Billing", href: "/billing", icon: "card" },
];

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
  // Foldable sidebar: icons only, more screen for content. Remembered per device.
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("cchat-nav-collapsed") === "1") setNavCollapsed(true);
    } catch {}
  }, []);

  const toggleNavCollapsed = useCallback(() => {
    setNavCollapsed((c) => {
      try {
        localStorage.setItem("cchat-nav-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  }, []);

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
      // Skip background work when the tab isn't visible — saves data + battery
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        // 1) Inbox: new customer messages (even when AI is handling) — show at most ONE per poll
        const inboxRes = await fetch("/api/inbox").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const convos: Array<any> = inboxRes?.conversations ?? [];
        if (!stopped && convos.length) {
          const now = Date.now();
          let newestNewMsg: { c: any; last: any } | null = null;
          let newestHandoff: any | null = null;
          for (const c of convos) {
            const msgs: any[] = c.msgs ?? [];
            if (!msgs.length) continue;
            const last = msgs[msgs.length - 1];
            const prevT = prevInboxRef.current.get(c.id) ?? 0;
            if (last.t > prevT) prevInboxRef.current.set(c.id, last.t);
            if (!isFirstInboxPoll.current) {
              if (last.from === "c" && now - last.t < 90_000 && last.t > prevT) {
                if (!newestNewMsg || last.t > newestNewMsg.last.t) newestNewMsg = { c, last };
              }
              if (c.status === "waiting" && c.reason) {
                const key = `handoff-${c.id}`;
                if (!seenLowStockRef.current.has(key) && (!newestHandoff || c.t > newestHandoff.t)) {
                  newestHandoff = c;
                }
              }
            }
          }
          if (newestNewMsg) {
            pushToast(`New message from ${newestNewMsg.c.name}`, (newestNewMsg.last.text || "").slice(0, 80), "info");
          } else if (newestHandoff) {
            const key = `handoff-${newestHandoff.id}`;
            seenLowStockRef.current.add(key);
            pushToast(`Handoff: ${newestHandoff.name} needs you`, newestHandoff.reason.slice(0, 80), "warn");
          }
          isFirstInboxPoll.current = false;
        }

        // 2) Out of stock / low stock — at most ONE per poll, out-of-stock first
        const ws = await fetch("/api/workspace").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (!stopped && ws?.products?.length && !isFirstInboxPoll.current) {
          const threshold = ws.lowStockThreshold ?? ws.policies?.lowStockThreshold ?? 3;
          let toNotify: any = null;
          let toNotifyKind: "oos" | "low" | null = null;
          for (const p of ws.products as Array<any>) {
            if (p.hidden) continue;
            if (p.stock === 0) {
              const key = `oos-${p.id}`;
              if (!seenLowStockRef.current.has(key)) {
                toNotify = p;
                toNotifyKind = "oos";
                break; // out-of-stock has priority
              }
            }
          }
          if (!toNotify) {
            for (const p of ws.products as Array<any>) {
              if (p.hidden || p.stock === 0) continue;
              if (p.stock > 0 && p.stock <= threshold) {
                const key = `low-${p.id}-${p.stock}`;
                if (!seenLowStockRef.current.has(key)) {
                  toNotify = p;
                  toNotifyKind = "low";
                  break;
                }
              }
            }
          }
          if (toNotify && toNotifyKind === "oos") {
            seenLowStockRef.current.add(`oos-${toNotify.id}`);
            pushToast(`Out of stock: ${toNotify.name}`, `Stock is 0 — AI will offer alternatives or notify list.`, "err");
          } else if (toNotify && toNotifyKind === "low") {
            seenLowStockRef.current.add(`low-${toNotify.id}-${toNotify.stock}`);
            pushToast(`Low stock: ${toNotify.name}`, `Only ${toNotify.stock} left — restock soon.`, "warn");
          }
        }
      } catch {}
    };

    // Initial poll after 4s, then every 45s (was 15s — same alerts, 3x less traffic)
    const initial = setTimeout(poll, 4000);
    timer = setInterval(poll, 45000);
    return () => {
      stopped = true;
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [accessChecked, pushToast]);

  const [inboxUnread, setInboxUnread] = useState(0);

  // Poll inbox for unread badge (scoped to business)
  useEffect(() => {
    if (!accessChecked) return;
    let stopped = false;
    const fetchUnread = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/inbox").then((r) => (r.ok ? r.json() : null)).catch(() => null);
        const convos: any[] = res?.conversations ?? [];
        const total = convos.reduce((s, c) => s + (c.unreadCount || 0), 0);
        if (!stopped) setInboxUnread(total);
      } catch {}
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 45000);
    // Also update when inbox read event fires
    const onRead = () => fetchUnread();
    window.addEventListener("inbox:read", onRead);
    return () => {
      stopped = true;
      clearInterval(id);
      window.removeEventListener("inbox:read", onRead);
    };
  }, [accessChecked]);

  // While checking, still show shell but with subtle loading - don't block entire app with spinner
  // Only block if we haven't checked yet and no settings loaded
  if (!accessChecked && !settings) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FCFCF9]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#6B6B6B] text-sm">Loading C-chat...</p>
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

  const fallback = hasIdentity ? "Replies on" : "Add your shop name";
  const subline = !hasIdentity
    ? "Set up your shop in Settings"
    : waConnected && !waPaused
      ? "WhatsApp ON — I reply for you"
      : waConnected && waPaused
        ? "WhatsApp stopped"
        : "Link WhatsApp to start";

  return (
    <div className="flex h-screen overflow-hidden bg-[#FCFCF9]">
      {/* mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[998] md:hidden bg-[#111]/20 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
      )}

      {/* sidebar — Notion light, foldable to icons */}
      <aside className={`${navCollapsed ? "md:w-[64px]" : "md:w-[232px]"} w-[232px] flex-none flex flex-col bg-white border-r border-[#E9E9E7] fixed inset-y-0 left-0 z-[999] transition-all duration-200 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className={`flex items-center gap-2 px-2.5 pt-3 pb-2 ${navCollapsed ? "md:flex-col md:items-center md:justify-center md:gap-3" : "md:justify-between"}`}>
          <Link href="/" className={`flex items-center gap-2.5 px-1.5 py-1.5 text-[#111] font-disp font-bold text-[16px] ${navCollapsed ? "md:justify-center" : ""}`}>
            <CchatLogo size={32} decorative className="shrink-0" />
            <span className={navCollapsed ? "md:hidden" : ""}>C-chat</span>
          </Link>
          <button
            onClick={toggleNavCollapsed}
            aria-label={navCollapsed ? "Expand menu" : "Fold menu to icons"}
            title={navCollapsed ? "Expand menu" : "Fold to icons"}
            className="hidden md:grid place-items-center w-8 h-8 rounded-[8px] border border-[#E9E9E7] bg-white text-[#6B6B6B] hover:text-[#111] hover:border-[#111] transition-colors shrink-0"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${navCollapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-auto px-2.5 py-2 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              title={n.label}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-[8px] text-[13.5px] font-medium text-[#6B6B6B] hover:bg-[#F7F7F5] hover:text-[#111] transition-colors ${navCollapsed ? "md:justify-center md:px-0" : ""}`}
            >
              <span className="text-[#9B9B9B] flex-none"><Icon name={n.icon} size={17} /></span>
              <span className={`flex-1 ${navCollapsed ? "md:hidden" : ""}`}>{n.label}</span>
              {n.id === "inbox" && inboxUnread > 0 && (
                <span className={`ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#111] text-white text-[11px] font-bold leading-none ${navCollapsed ? "md:absolute md:ml-5 md:-mt-5 md:min-w-[16px] md:h-[16px] md:text-[10px]" : ""}`}>
                  {inboxUnread > 99 ? "99+" : inboxUnread}
                </span>
              )}
            </Link>
          ))}
        </nav>
        {!navCollapsed && (
          <div className="p-3 m-3 mt-auto rounded-[12px] bg-[#F7F7F5] border border-[#E9E9E7] text-xs">
            {(() => {
              const info = planBadgeInfo({
                status: settings?.planStatus ?? "inactive",
                plan: settings?.plan ?? null,
                trialEndsAt: settings?.trialEndsAt ?? null,
                expiresAt: settings?.expiresAt ?? null,
              });
              const tone =
                info.tone === "premium" || info.tone === "extra"
                  ? "bg-[#111] text-white"
                  : info.tone === "trial"
                    ? "bg-white text-[#111] border border-[#E9E9E7]"
                    : "bg-white text-[#6B6B6B] border border-[#E9E9E7]";
              const isTrial = info.tone === "trial";
              return (
                <Link href="/billing" className="block group">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-[8px] font-semibold transition-colors ${tone}`}>
                    {isTrial ? <Icon name="clock" size={14} /> : info.crown ? <GoldCrown size={14} /> : null}
                    <span className="text-[13px]">{info.label}</span>
                    <span className="ml-auto opacity-40 text-[#9B9B9B]">›</span>
                  </div>
                  <div className="text-[#9B9B9B] mt-2 px-1 leading-relaxed">
                    {info.tone === "none"
                      ? "15,000 TSh/mo · 3-day free trial"
                      : info.tone === "trial"
                        ? "Full access while you try C-chat"
                        : info.tone === "extra"
                          ? "Yearly plan · thanks for the support "
                          : "Monthly plan · thanks for the support "}
                  </div>
                </Link>
              );
            })()}
          </div>
        )}
      </aside>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFCF9] transition-all duration-200">
        {isTrialing && trialEndsAt && (
          <div className="flex-none bg-white border-b border-[#E9E9E7] px-3 sm:px-5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-[13px] sm:text-sm leading-[1.4]">
            <span className="flex items-center gap-2 font-medium text-[#111] min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#111] shrink-0" />
              <span className="truncate sm:whitespace-normal">Free trial: <b>{trialDaysLeft}d</b> left — ends {trialEndsAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            </span>
            <Link href="/billing" className="self-start sm:self-auto inline-flex items-center justify-center text-xs font-semibold px-3.5 py-1.5 rounded-[8px] bg-[#111] text-white hover:bg-black transition-colors whitespace-nowrap shrink-0">View plans</Link>
          </div>
        )}
        <header className="h-14 flex-none bg-white/80 backdrop-blur-[10px] border-b border-[#E9E9E7] flex items-center gap-2 sm:gap-3.5 px-3 sm:px-5 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex-none w-8 h-8 grid place-items-center rounded-[8px] border border-[#E9E9E7] bg-white text-[#111]"
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/settings" className="flex items-center gap-2.5 min-w-0 group">
            {logo ? (
              <span className="w-8 h-8 rounded-[8px] overflow-hidden flex-none border border-[#E9E9E7] bg-white flex items-center justify-center p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={businessName || "Business logo"} className="w-full h-full object-cover rounded-[6px]" />
              </span>
            ) : (
              <span className="w-8 h-8 rounded-[8px] bg-[#F1F1EF] border border-[#E9E9E7] text-[#6B6B6B] flex items-center justify-center font-semibold text-[12px] flex-none">
                {hasIdentity ? initials(businessName) : "?"}
              </span>
            )}
            <span className="min-w-0 block">
              <span className="font-semibold text-[13px] truncate block text-[#111] group-hover:underline">
                {hasIdentity ? businessName : "Set up your business"}
              </span>
              <span className="text-[11.5px] text-[#9B9B9B] truncate block">{subline}</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 min-w-0 shrink-0">
            {waConnected && !waPaused ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E3F4E9] text-[#0E7A47] border border-[#BCE5CB] whitespace-nowrap">
                  <span className="relative flex w-2 h-2"><span className="absolute inline-flex h-full w-full rounded-full bg-[#149A5B] opacity-60 animate-ping" /><span className="relative inline-flex w-2 h-2 rounded-full bg-[#149A5B]" /></span>
                  LIVE
                </span>
                <span className="sm:hidden inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E3F4E9] text-[#0E7A47] border border-[#BCE5CB]">
                  <span className="relative flex w-2.5 h-2.5"><span className="absolute inline-flex h-full w-full rounded-full bg-[#149A5B] opacity-60 animate-ping" /><span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-[#149A5B]" /></span>
                </span>
              </>
            ) : waConnected && waPaused ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F7F7F5] text-[#6B6B6B] border border-[#E9E9E7] whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B9B9B]" />
                  Paused
                </span>
                <span className="sm:hidden inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F7F7F5] text-[#6B6B6B] border border-[#E9E9E7]">
                  <span className="w-2 h-2 rounded-full bg-[#9B9B9B]" />
                </span>
              </>
            ) : (
              <Link
                href="/settings"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-[#111] border border-[#E9E9E7] hover:bg-[#F7F7F5] transition-colors whitespace-nowrap"
              >
                Connect WhatsApp
              </Link>
            )}
            {settings?.avatar ? (
              <Link href="/settings" title="Edit profile" className="flex-none hidden sm:block">
                <span className="w-8 h-8 rounded-[8px] overflow-hidden border border-[#E9E9E7] inline-block hover:border-[#111] transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.avatar} alt={user?.firstName || "Profile"} className="w-full h-full object-cover" />
                </span>
              </Link>
            ) : null}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-[8px]",
                  userButtonPopoverCard: "mx-2 sm:mx-0 w-[calc(100vw-16px)] sm:w-[360px] max-w-[360px]",
                  userButtonPopoverActionButton: "py-2.5",
                },
              }}
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">{children}</main>
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
