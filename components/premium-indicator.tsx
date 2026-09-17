import React from "react";
import { GoldCrown } from "@/components/premium";

/**
 * Reusable Premium crown — reuses the SAME GoldCrown asset from pricing/billing.
 * Ensures consistent visual across: billing, subscription, settings, dashboard, nav.
 */
export function PremiumCrown({ size = 16, className }: { size?: number; className?: string }) {
  return <GoldCrown size={size} className={className} />;
}

/** Small outline crown used for "SAVE 20%" ribbon — matches landing pricing crown */
export function SaveCrown({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4l4 -6" />
    </svg>
  );
}

export function PremiumLabel({
  plan,
  size = 14,
}: {
  plan: "premium" | "extra" | "trial" | "none";
  size?: number;
}) {
  if (plan === "none") return null;
  if (plan === "trial") return null; // trial uses clock, not crown
  return <PremiumCrown size={size} />;
}
