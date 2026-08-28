"use client";

import { useEffect, useState } from "react";
import { CrownIcon, GoldCrown, planBadgeInfo } from "@/components/premium";
import { PremiumBadge, ExtraPremiumBadge, MiniPlanBadge } from "@/components/plan-badges";

const FEATURES = [
  "12,000 AI messages every month",
  "Your products, prices and stock, always current",
  "Swahili first, English automatic",
  "You take over any chat, any time",
  "Your rules for delivery, returns and warranties",
  "Every conversation kept in one inbox",
  "Sales tracking and revenue at a glance",
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-grn-d">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function BillingPage() {
  const [status, setStatus] = useState<{
    status: string;
    plan: string | null;
    trialEndsAt: string | null;
    expiresAt: string | null;
  } | null>(null);
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !d.error) {
          setStatus({
            status: d.status ?? "inactive",
            plan: d.plan ?? null,
            trialEndsAt: d.trialEndsAt ?? null,
            expiresAt: d.subscriptionExpiresAt ?? null,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const info = status
    ? planBadgeInfo(status)
    : { label: "…", tone: "none" as const, crown: false, name: "None" as const };
  const trialLeft = status?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((new Date(status.trialEndsAt).getTime() - Date.now()) / 86400000)
      )
    : 0;

  async function startTrial() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_trial" }),
      });
      if (res.ok) {
        setStatus((prev) => prev ? { ...prev, status: "trialing", trialEndsAt: new Date(Date.now() + 3 * 86400000).toISOString() } : prev);
      }
    } catch {}
    setLoading(false);
  }

  async function subscribe(plan: "monthly" | "yearly") {
    setLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", plan }),
      });
      if (res.ok) {
        const duration = plan === "yearly" ? 365 : 30;
        setStatus((prev) => prev ? {
          ...prev,
          status: "active",
          plan,
          expiresAt: new Date(Date.now() + duration * 86400000).toISOString(),
        } : prev);
      }
    } catch {}
    setLoading(false);
  }

  const currentBadge =
    info.tone === "extra" ? (
      <MiniPlanBadge kind="extra" size={52} />
    ) : info.tone === "premium" ? (
      <MiniPlanBadge kind="premium" size={52} />
    ) : (
      <span
        className={`w-[52px] h-[52px] rounded-[13px] flex items-center justify-center flex-none ${
          info.tone === "trial" ? "bg-[#FDF6E3]" : "bg-[#EEF2ED] text-muted"
        }`}
      >
        <GoldCrown size={26} />
      </span>
    );

  const trialActive = status?.status === "trialing" && trialLeft > 0;
  const trialExpired = status?.status === "trialing" && trialLeft <= 0;

  let stateLine = "Start your 3-day free trial anytime";
  if (trialActive) {
    stateLine = `Free Trial · ${trialLeft} day${trialLeft === 1 ? "" : "s"} left`;
  } else if (trialExpired) {
    stateLine = "Your free trial has ended";
  } else if (status?.status === "active") {
    stateLine =
      info.tone === "extra"
        ? "Extra Premium · yearly subscription active"
        : "Premium · monthly subscription active";
  }

  return (
    <div className="viewwrap max-w-[1100px] mx-auto pb-10">
      <div className="section-h mb-6">
        <div>
          <h2>Billing</h2>
          <p>One simple plan. Pay with M-Pesa, Tigo Pesa or card.</p>
        </div>
      </div>

      {/* current status strip */}
      <div className="bg-white border border-cborder rounded-[16px] px-5 py-4 flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          {currentBadge}
          <div>
            <div className="font-bold text-sm text-dark">{info.name}</div>
            <div className="text-[12px] text-muted">{stateLine}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="livechip"><span className="dot g" /> Secure payment</span>
          <span className="text-[11px] text-muted">M-Pesa · Tigo Pesa · Airtel Money · Card</span>
        </div>
      </div>

      {/* pricing grid */}
      <div className="border border-cborder rounded-[18px] overflow-hidden">
        <div className="grid grid-cols-1 gap-px bg-[#E4EDE5] md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-center bg-white p-8 md:col-span-2 lg:col-span-1">
            <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">
              Pricing
            </p>
            <h1 className="font-disp font-extrabold text-[30px] leading-[1.08] tracking-tight text-dark">
              One plan.
              <br />
              Everything included.
            </h1>
            <p className="mt-3 text-muted text-[13.5px] leading-relaxed">
              Start with 3 days free — no card needed.
            </p>
            <div className="mt-5 inline-flex rounded-full border border-cborder p-1 w-fit">
              <button
                onClick={() => setYearly(false)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${!yearly ? "bg-dark text-white" : "text-muted hover:text-dark"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${yearly ? "bg-dark text-white" : "text-muted hover:text-dark"}`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* PREMIUM — monthly */}
          <PlanCard
            name="Premium"
            price="12,000"
            period="TSh / month"
            description="Everything included, billed monthly."
            cta="Subscribe"
            highlight={!yearly}
            badgeKind={yearly ? undefined : "premium"}
            onPay={() => subscribe("monthly")}
          />

          {/* EXTRA PREMIUM — yearly */}
          <PlanCard
            name="Extra Premium"
            price="115,200"
            period="TSh / year"
            description="Same everything, billed once a year."
            cta="Subscribe"
            highlight={yearly}
            badge="SAVE 20%"
            badgeKind={yearly ? "extra" : undefined}
            footnote="Works out to 9,600 TSh / month"
            onPay={() => subscribe("yearly")}
          />
        </div>

        {/* feature list strip */}
        <div className="bg-white px-8 py-7 border-t border-[#E4EDE5]">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted">
            Every plan includes
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-dark/80">
                <Check /> {f}
              </li>
            ))}
          </ul>
          <div className="rulecard mt-5">
            <span>
              <b>3-day free trial</b> on every new account — full access, no card required.
              Your customers&apos; money never touches Cchat.
            </span>
            {!trialActive && !trialExpired && (
              <button
                onClick={startTrial}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-grn text-white rounded-lg text-sm font-semibold hover:bg-grn-d transition-colors disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Free Trial"}
              </button>
            )}
            {trialActive && (
              <div className="mt-2 text-sm font-semibold text-grn-d">
                Active — {trialLeft} day{trialLeft === 1 ? "" : "s"} remaining
              </div>
            )}
            {trialExpired && (
              <div className="mt-2 text-sm font-semibold text-amber-600">
                Trial expired — choose a plan below to continue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  badge,
  badgeKind,
  cta,
  highlight,
  footnote,
  onPay,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  badgeKind?: "premium" | "extra";
  cta: string;
  highlight?: boolean;
  footnote?: string;
  onPay: () => void;
}) {
  return (
    <div
      className={`relative flex flex-col bg-white transition-shadow ${
        highlight ? "shadow-[inset_0_0_0_2px_#149A5B]" : ""
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-[1px] right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-b-[8px] text-[10.5px] font-extrabold uppercase tracking-wider bg-amb-bg text-amber-600`}
        >
          <CrownIcon className="w-3 h-3" /> {badge}
        </span>
      )}
      <div className={`p-8 border-b ${highlight ? "border-[#BCE5CB]" : "border-[#EEF2ED]"} flex flex-col flex-1`}>
        <div className="mb-4 flex items-center justify-center">
          {badgeKind === "extra" ? (
            <ExtraPremiumBadge size={92} />
          ) : badgeKind === "premium" ? (
            <PremiumBadge size={92} />
          ) : null}
        </div>
        <p className="mb-4 text-muted text-[12px] font-bold uppercase tracking-wider">{name}</p>
        <div className="mb-1.5 flex items-baseline gap-2">
          <h3 className="font-disp font-extrabold text-[38px] leading-none tracking-tight text-dark">
            {price}
          </h3>
          <span className="text-muted text-[12px]">{period}</span>
        </div>
        {footnote && <p className="text-[12px] text-grn-d font-semibold mb-1">{footnote}</p>}
        <p className="mb-7 text-muted text-[13px]">{description}</p>
        <button
          onClick={onPay}
          className={`btn wide ${highlight ? "pri" : "ghost"}`}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
