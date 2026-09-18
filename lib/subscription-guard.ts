/**
 * Shared subscription gate used by both the non-localized
 * `app/(dashboard)/layout.tsx` and the localized
 * `app/[locale]/dashboard/layout.tsx`.
 * Keep the blocking semantics in one place so the two routes can't drift.
 */

type SubscriptionRow = {
  isDemoOwner?: boolean | null;
  subscriptionStatus?: string | null;
  trialEndsAt?: Date | string | null;
  subscriptionExpiresAt?: Date | string | null;
};

export function isSubscriptionBlocked(u: SubscriptionRow): boolean {
  // Demo account bypasses subscription gate
  if (u.isDemoOwner) return false;

  const status = u.subscriptionStatus || "inactive";
  const trialEnds = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() : 0;
  const subEnds = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() : 0;
  const now = Date.now();
  const trialExpired = status === "trialing" && trialEnds > 0 && trialEnds <= now;
  const isExpired = status === "expired" || trialExpired;
  return (
    status === "inactive" ||
    status === "canceled" ||
    isExpired ||
    (status === "active" && subEnds > 0 && subEnds <= now)
  );
}
