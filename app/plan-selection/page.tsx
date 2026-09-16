"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CchatLogo from "@/components/branding/CchatLogo";
import { Icon } from "@/components/icons";

const PLANS = [
  {
    id: "trial",
    name: "3-Day Free Trial",
    price: "Free",
    period: "for 3 days",
    badge: "START HERE",
    badgeColor: "bg-[#111] text-white",
    features: [
      "Full access to all features",
      "AI WhatsApp agent",
      "Unlimited conversations",
      "Product & service catalog",
      "Business policies",
      "Inbox & analytics",
      "No card required",
    ],
    cta: "Start Free Trial",
    isPrimary: true,
    available: true,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "15,000",
    period: "TSh / month",
    badge: "Coming Soon",
    badgeColor: "bg-amber-100 text-amber-700",
    features: [
      "Everything in Free Trial",
      "Continued access after trial",
      "Priority support",
      "Monthly billing",
      "Cancel anytime",
    ],
    cta: "Notify Me When Ready",
    isPrimary: false,
    available: false,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "144,000",
    period: "TSh / year",
    badge: "Save 20% · Coming Soon",
    badgeColor: "bg-grn-bg text-[#111]",
    features: [
      "Everything in Monthly",
      "Best value — save 20% · 144,000 TSh/year (was 180,000)",
      "Yearly billing",
      "Priority support",
      "Cancel anytime",
    ],
    cta: "Notify Me When Ready",
    isPrimary: false,
    available: false,
  },
];

function PlanCard({ plan, onSelect, loading }: { plan: typeof PLANS[0]; onSelect: (id: string) => void; loading: boolean }) {
  const isDisabled = !plan.available || loading;
  return (
    <div
      className={`relative flex flex-col h-full bg-white rounded-[16px] border transition-all ${
        plan.isPrimary
          ? "border-[#111] shadow-[inset_0_0_0_1.5px_#111]"
          : "border-[#E9E9E7] hover:border-[#111]"
      } ${isDisabled && !plan.isPrimary ? "opacity-60" : ""}`}
    >
      <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${plan.badgeColor}`}>
        {plan.badge}
      </span>

      <div className="p-8 flex flex-col flex-1">
        <div className="text-center mb-6">
          <h3 className="font-disp font-extrabold text-2xl text-dark mb-1">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-disp font-extrabold text-4xl text-dark">{plan.price}</span>
            <span className="text-muted text-sm self-end mb-1">{plan.period}</span>
          </div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-dark/80">
              <span className="shrink-0 w-5 h-5 mt-0.5 text-[#111] grid place-items-center"><Icon name="check" size={16} /></span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelect(plan.id)}
          disabled={isDisabled}
          className={`w-full py-3.5 px-6 rounded-[12px] font-semibold text-[14px] transition-colors ${
            plan.isPrimary
              ? "bg-[#111] text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              : "bg-white border border-[#E9E9E7] text-[#111] hover:border-[#111] hover:bg-[#F7F7F5] disabled:border-[#E9E9E7] disabled:text-[#9B9B9B] disabled:cursor-not-allowed"
          }`}
        >
          {loading ? "Starting..." : plan.cta}
        </button>
      </div>

      {!plan.available && !plan.isPrimary && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-amber-700">Payment integration coming soon</p>
            <p className="text-xs text-amber-600 mt-1">We'll notify you when it's ready</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingStatus, setBillingStatus] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.status) setBillingStatus(d.status);
        if (d?.trialEndsAt) setTrialEndsAt(d.trialEndsAt);
      })
      .catch(() => {});
  }, []);

  const expired = billingStatus === "expired";
  const trialActive = billingStatus === "trialing";

  const handleSelect = async (planId: string) => {
    if (planId === "trial") {
      if (expired) {
        // For now expired users cannot restart trial via same endpoint if previously trialing
        // Show message; trial reuse is blocked server-side.
      }
      if (trialActive) {
        router.push("/dashboard");
        return;
      }
      setLoading("trial");
      try {
        const res = await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start_trial" }),
        });
        if (res.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          const err = await res.json();
          // If trial already active, just enter dashboard
          if (err?.error?.includes("already active")) {
            router.push("/dashboard");
          } else {
            alert(err.error || "Failed to start trial. Please try again.");
          }
        }
      } catch {
        alert("Connection error. Please try again.");
      } finally {
        setLoading(null);
      }
    } else {
      alert(`${PLANS.find((p) => p.id === planId)?.name} is coming soon. Payment integration with Pesapal will be added when credentials are available.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCF9] text-[#111]">
      <header className="flex items-center gap-3 px-[5vw] py-5 border-b border-[#E9E9E7] bg-white/80 backdrop-blur-[10px] sticky top-0">
        <Link href="/" className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-[#111]">
          <CchatLogo size={40} decorative className="shrink-0" />
          C-chat
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-[5vw] py-10">
        <div className="w-full max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E9E9E7] text-[#111] text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-[#111] animate-pulse" />
              {billingStatus === "expired" ? "Trial ended" : "Choose your plan"}
            </div>
            <h1 className="font-disp font-[800] text-[clamp(28px,4vw,48px)] tracking-tight text-[#111] mb-3">
              {billingStatus === "expired" ? "Your free trial has ended" : "Start using your AI agent"}
            </h1>
            <p className="text-[#6B6B6B] text-[16px] max-w-[600px] mx-auto">
              {billingStatus === "expired" ? (
                <>
                  Choose a plan to continue using C-chat. Monthly and Yearly payments will be enabled soon via Pesapal.
                  {trialEndsAt && (
                    <span className="block mt-2 text-sm text-[#9B9B9B]">Trial ended on {new Date(trialEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </>
              ) : (
                <>
                  You&apos;ve completed onboarding. Now pick a plan to enter C-chat. The <span className="font-semibold text-[#111]">3-Day Free Trial</span> gives you full access immediately — no card needed.
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handleSelect} loading={loading === plan.id} />
            ))}
          </div>

          <p className="text-center text-[#6B6B6B] text-sm mt-8 max-w-[600px] mx-auto">
            Monthly and Yearly plans will be enabled once Pesapal payment integration is configured.
            For now, start your <b className="text-[#111]">3-Day Free Trial</b> to use C-chat immediately.
          </p>

          <div className="mt-10 text-center">
            <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#privacy" className="text-sm text-[#6B6B6B] hover:text-[#111] transition-colors mr-4">Privacy</Link>
            <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#terms" className="text-sm text-[#6B6B6B] hover:text-[#111] transition-colors mr-4">Terms</Link>
            <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#acceptable-use" className="text-sm text-[#6B6B6B] hover:text-[#111] transition-colors mr-4">Acceptable Use</Link>
            <Link href="/jinsi-ya-kufanya-biashara-mtandaoni-tanzania#sheria" className="text-sm text-[#6B6B6B] hover:text-[#111] transition-colors font-semibold">Mwongozo wa Biashara Mtandao</Link>
          </div>
        </div>
      </main>

      <footer className="px-[5vw] py-6 border-t border-[#E9E9E7] bg-white">
        <p className="text-center text-[12px] text-[#9B9B9B]">© 2026 C-chat. Built in Dar es Salaam.</p>
      </footer>
    </div>
  );
}