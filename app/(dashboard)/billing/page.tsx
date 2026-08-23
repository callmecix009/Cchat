"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CrownIcon, planBadgeInfo } from "@/components/premium";

const FEATURES = [
  "12,000 AI messages every month",
  "Live stock & price sync",
  "Swahili-first AI with auto English",
  "Human takeover & smart handoffs",
  "Products, services & policies brain",
  "Forever-stored inbox",
  "Sales tracking & revenue stats",
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
  const [yearly, setYearly] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setStatus({
            status: d.planStatus ?? "inactive",
            plan: d.plan ?? null,
            trialEndsAt: d.trialEndsAt ?? null,
            expiresAt: d.expiresAt ?? null,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const info = status
    ? planBadgeInfo(status)
    : { label: "…", tone: "none" as const, crown: false };
  const trialLeft = status?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((new Date(status.trialEndsAt).getTime() - Date.now()) / 86400000)
      )
    : 0;

  function pay(plan: "monthly" | "yearly") {
    alert(
      `Secure checkout for the ${plan} plan is coming soon.\n\nYou'll pay with M-Pesa, Tigo Pesa, Airtel Money or card.`
    );
  }

  return (
    <div className="viewwrap max-w-[1100px] mx-auto pb-10">
      <div className="section-h mb-6">
        <div>
          <h2>Billing</h2>
          <p>One simple plan. Pay with M-Pesa, Tigo Pesa or card via Pesapal.</p>
        </div>
      </div>

      {/* current status strip */}
      <div className="bg-white border border-cborder rounded-[16px] px-5 py-4 flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 rounded-[11px] flex items-center justify-center ${
              info.tone === "premium"
                ? "bg-grn-bg text-grn-d"
                : info.tone === "trial"
                  ? "bg-amb-bg text-amber-600"
                  : "bg-[#EEF2ED] text-muted"
            }`}
          >
            <CrownIcon className="w-5 h-5" />
          </span>
          <div>
            <div className="font-bold text-sm text-dark">{info.label}</div>
            <div className="text-[12px] text-muted">
              {status?.status === "trialing" && trialLeft > 0
                ? `Full access · ${trialLeft} day${trialLeft === 1 ? "" : "s"} remaining`
                : status?.status === "active"
                  ? "All features unlocked"
                  : "Start your 7-day free trial anytime"}
            </div>
          </div>
        </div>
          <div className="flex flex-col items-end gap-1">
            <span className="livechip"><span className="dot g" /> Secure payment</span>
            <span className="text-[11px] text-muted">M-Pesa · Tigo Pesa · Airtel Money · Card</span>
          </div>
      </div>

      {/* pricing-2 style grid */}
      <div className="border border-cborder rounded-[18px] overflow-hidden">
        <div className="grid grid-cols-1 gap-px bg-[#E4EDE5] md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-center bg-white p-8 md:col-span-2 lg:col-span-1 lg:row-span-1">
            <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">
              Pricing
            </p>
            <h1 className="font-disp font-extrabold text-[30px] leading-[1.08] tracking-tight text-dark">
              One plan.
              <br />
              Zero drama.
            </h1>
            <p className="mt-3 text-muted text-[13.5px] leading-relaxed">
              Everything included on every plan. Start free — no card needed.
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

          {/* MONTHLY */}
          <PlanCard
            name={yearly ? "Monthly" : "Monthly"}
            price="12,000"
            period="TSh / month"
            description="Full agent, billed every month."
            cta="Subscribe"
            popular={false}
            highlight={false}
            onPay={() => pay("monthly")}
          />

          {/* YEARLY */}
          <PlanCard
            name="Yearly"
            price="115,200"
            period="TSh / year"
            description={"Billed once a year."}
            badge="SAVE 20%"
            cta="Subscribe"
            popular
            highlight={yearly}
            onPay={() => pay("yearly")}
            footnote="≈ 9,600 TSh / month"
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
              <b>7-day free trial</b> on every new account — full access, no card required.
              We&apos;ll remind you a day before it ends. Your customers&apos; money never
              touches Cchat.
            </span>
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
  cta,
  popular,
  highlight,
  footnote,
  onPay,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  cta: string;
  popular?: boolean;
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
      {(popular || badge) && (
        <span
          className={`absolute -top-[1px] right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-b-[8px] text-[10.5px] font-extrabold uppercase tracking-wider ${
            popular ? "bg-grn text-white" : "bg-amb-bg text-amber-600"
          }`}
        >
          {badge === "SAVE 20%" && <CrownIcon className="w-3 h-3" />}
          {badge ?? "Popular"}
        </span>
      )}
      <div className={`p-8 border-b ${highlight ? "border-[#BCE5CB]" : "border-[#EEF2ED]"}`}>
        <p className="mb-5 text-muted text-[12px] font-bold uppercase tracking-wider">{name}</p>
        <div className="mb-1.5 flex items-baseline gap-2">
          <h3 className="font-disp font-extrabold text-[38px] leading-none tracking-tight text-dark">
            {price}
          </h3>
          <span className="text-muted text-[12px]">{period}</span>
        </div>
        {footnote && <p className="text-[12px] text-grn-d font-semibold mb-1">{footnote}</p>}
        <p className="mb-7 text-muted text-[13px] line-clamp-2">{description}</p>
        <button
          onClick={onPay}
          className={`btn wide ${highlight || popular ? "pri" : "ghost"}`}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
