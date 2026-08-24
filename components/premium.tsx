import React from "react";

export function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.5 7.5l4.5 3.5 4-6 4-6 4 6 4.5-3.5c.9-.7 2.1.1 1.9 1.2l-1.6 8A2 2 0 0 1 17.84 18H6.16a2 2 0 0 1-1.96-1.3l-1.6-8c-.22-1.1.99-1.9 1.9-1.2z" />
    </svg>
  );
}

/** Polished gold crown for premium/trial status spots. */
export function GoldCrown({ className, size = 22 }: { className?: string; size?: number }) {
  const uid = React.useId().replace(/:/g, "");
  const id = `gc-${uid}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3D271" />
          <stop offset="50%" stopColor="#DFA92B" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M2.5 7.5l4.5 3.5 4-6 4-6 4 6 4.5-3.5c.9-.7 2.1.1 1.9 1.2l-1.6 8A2 2 0 0 1 17.84 18H6.16a2 2 0 0 1-1.96-1.3l-1.6-8c-.22-1.1.99-1.9 1.9-1.2z"
      />
      <circle cx="6.5" cy="6.2" r="1.4" fill={`url(#${id})`} />
      <circle cx="12" cy="4" r="1.4" fill={`url(#${id})`} />
      <circle cx="17.5" cy="6.2" r="1.4" fill={`url(#${id})`} />
    </svg>
  );
}

export type PlanState = {
  status: string;
  plan: string | null;
  trialEndsAt: string | null;
  expiresAt: string | null;
};

export function planBadgeInfo(s: PlanState) {
  const now = Date.now();
  const trialLeft = s.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(s.trialEndsAt).getTime() - now) / 86400000))
    : 0;
  if (s.status === "trialing" && trialLeft > 0) {
    return { label: `Free Trial · ${trialLeft}d left`, tone: "trial" as const, crown: true, name: "Free Trial" as const };
  }
  if (s.status === "trialing") {
    return { label: "Free trial ended", tone: "trial" as const, crown: true, name: "Free Trial" as const };
  }
  if (s.status === "active") {
    return s.plan === "yearly"
      ? { label: "Extra Premium", tone: "extra" as const, crown: true, name: "Extra Premium" as const }
      : { label: "Premium", tone: "premium" as const, crown: true, name: "Premium" as const };
  }
  return { label: "Upgrade", tone: "none" as const, crown: false, name: "No plan" as const };
}
