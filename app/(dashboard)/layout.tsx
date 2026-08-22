"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { initials } from "@/lib/demo";
import CchatLogo from "@/components/branding/CchatLogo";

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
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [settings, setSettings] = useState<BizSettings | null>(null);

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

  const businessName = settings?.business?.name?.trim() || "";
  const logo = settings?.logo || null;
  const hasIdentity = !!businessName;
  const waConnected = settings?.whatsappConnected ?? false;
  const waPaused = settings?.whatsappPaused ?? false;
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
      {/* sidebar */}
      <aside className="w-[236px] flex-none hidden md:flex flex-col bg-[#0C2417] text-[#C9DCCE]">
        <Link href="/" className="flex items-center gap-2.5 px-5 pt-5 pb-3.5 text-white font-disp font-extrabold text-lg">
          <CchatLogo size={32} decorative className="shrink-0" />
          Cchat
        </Link>
        <nav className="flex-1 overflow-auto px-2.5 py-1.5 space-y-0.5">
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold text-[#A9C2B0] hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="opacity-90">{ICONS[n.icon]}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3.5 m-2.5 rounded-xl bg-white/5 text-xs">
          <div className="flex justify-between font-bold text-white mb-1">
            <span>Pro plan</span>
            <span>$5/mo</span>
          </div>
          <div className="text-[#86A893]">12,000 AI messages included</div>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <header className="h-[62px] flex-none bg-white border-b border-cborder flex items-center gap-3.5 px-5">
          <Link href="/settings" className="flex items-center gap-2.5 min-w-0 group">
            {logo ? (
              <span className="w-9 h-9 rounded-[10px] overflow-hidden flex-none ring-1 ring-cborder">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={businessName || "Business logo"} className="w-full h-full object-cover" />
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
          <div className="ml-auto flex items-center gap-3 min-w-0">
            {waConnected && !waPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-grn-bg text-grn-d border border-grn-br whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-grn animate-pulse" />
                WhatsApp Connected
              </span>
            ) : waConnected && waPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amb-bg text-amber-600 border border-amb-br whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                WhatsApp Paused
              </span>
            ) : (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EEF2ED] text-[#5D7064] border border-[#DFE7DF] hover:border-grn hover:text-grn-d transition-colors whitespace-nowrap"
              >
                Connect WhatsApp
              </Link>
            )}
            {settings?.avatar ? (
              <Link href="/settings" title="Edit profile" className="flex-none">
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
                },
              }}
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}