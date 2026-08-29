"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CchatLogo from "@/components/branding/CchatLogo";

const PLANS = [
  {
    id: "trial",
    name: "3-Day Free Trial",
    price: "Free",
    period: "for 3 days",
    badge: "START HERE",
    badgeColor: "bg-lime text-[#06170D]",
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
    price: "12,000",
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
    price: "115,200",
    period: "TSh / year",
    badge: "Save 20% · Coming Soon",
    badgeColor: "bg-grn-bg text-grn-d",
    features: [
      "Everything in Monthly",
      "Best value — save 20%",
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
      className={`relative flex flex-col h-full bg-white rounded-2xl border-2 transition-all ${
        plan.isPrimary
          ? "border-lime shadow-[0_0_0_2px_#8FF0B4]"
          : "border-[#EEF2ED] hover:border-[#D2DCD1]"
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
              <svg className="shrink-0 w-5 h-5 mt-0.5 text-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelect(plan.id)}
          disabled={isDisabled}
          className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-base transition-all ${
            plan.isPrimary
              ? "bg-lime text-[#06170D] hover:bg-[#53E89B] shadow-[0_6px_16px_-6px_rgba(143,240,180,.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              : "bg-white border border-[#D2DCD1] text-dark hover:border-grn hover:text-grn-d disabled:border-[#E4EDE5] disabled:text-[#B9CDBF] disabled:cursor-not-allowed"
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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg,#071510 0%,#0C2417 60%,#0F2E1D 100%)' }}>
      <header className="flex items-center gap-3 px-[5vw] py-5">
        <Link href="/" className="flex items-center gap-[9px] font-disp font-[800] text-[21px] tracking-tight text-white">
          <CchatLogo size={32} decorative className="shrink-0" />
          Cchat
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-[5vw] py-10">
        <div className="w-full max-w-[1000px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/10 text-lime text-sm font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              {billingStatus === "expired" ? "Trial ended" : "Choose your plan"}
            </div>
            <h1 className="font-disp font-[800] text-[clamp(28px,4vw,48px)] tracking-tight text-white mb-3">
              {billingStatus === "expired" ? "Your free trial has ended" : "Start using your AI agent"}
            </h1>
            <p className="text-[#B9CDBF] text-[16px] max-w-[600px] mx-auto">
              {billingStatus === "expired" ? (
                <>
                  Choose a plan to continue using Cchat. Monthly and Yearly payments will be enabled soon via Pesapal.
                  {trialEndsAt && (
                    <span className="block mt-2 text-sm text-[#8FAA99]">Trial ended on {new Date(trialEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </>
              ) : (
                <>
                  You&apos;ve completed onboarding. Now pick a plan to enter Cchat. The <span className="font-semibold text-lime">3-Day Free Trial</span> gives you full access immediately — no card needed.
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handleSelect} loading={loading === plan.id} />
            ))}
          </div>

          <p className="text-center text-[#8FAA99] text-sm mt-8 max-w-[600px] mx-auto">
            Monthly and Yearly plans will be enabled once Pesapal payment integration is configured.
            For now, start your <b className="text-lime">3-Day Free Trial</b> to use Cchat immediately.
          </p>

          <div className="mt-10 text-center">
            <Link href="/privacy" className="text-sm text-[#8FAA99] hover:text-lime transition-colors mr-4">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-[#8FAA99] hover:text-lime transition-colors mr-4">Terms of Service</Link>
            <Link href="/acceptable-use" className="text-sm text-[#8FAA99] hover:text-lime transition-colors">Acceptable Use</Link>
          </div>
        </div>
      </main>

      <footer className="px-[5vw] py-6 border-t border-[rgba(143,240,180,.08)]">
        <p className="text-center text-[12px] text-[#8FAA99]">© 2026 Cchat. Built in Dar es Salaam.</p>
      </footer>
    </div>
  );
}