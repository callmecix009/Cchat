export function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2.5 7.5l4.5 3.5 4-6 4 6 4.5-3.5c.9-.7 2.1.1 1.9 1.2l-1.6 8A2 2 0 0 1 17.84 18H6.16a2 2 0 0 1-1.96-1.3l-1.6-8c-.22-1.1.99-1.9 1.9-1.2z" />
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
    return { label: `Free trial · ${trialLeft}d left`, tone: "trial" as const, crown: true, name: "Free Trial" as const };
  }
  if (s.status === "active") {
    return s.plan === "yearly"
      ? { label: "Extra Premium", tone: "extra" as const, crown: true, name: "Extra Premium" as const }
      : { label: "Premium", tone: "premium" as const, crown: true, name: "Premium" as const };
  }
  return { label: "Upgrade", tone: "none" as const, crown: false, name: "None" as const };
}
