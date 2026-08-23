"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function TrendIcon({ up, className }: { up: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3 shrink-0", className)}
      aria-hidden="true"
    >
      {up ? (
        <polyline points="3 17 9 11 13 15 21 7" />
      ) : (
        <polyline points="3 7 9 13 13 9 21 17" />
      )}
      {up ? <polyline points="15 7 21 7 21 13" /> : <polyline points="15 17 21 17 21 11" />}
    </svg>
  );
}

export function Delta({
  value,
  lowerIsBetter = false,
  variant = "text",
  suffix = "%",
  className,
}: {
  value: number;
  /** when true a negative number is favorable (queue depth, reply time) */
  lowerIsBetter?: boolean;
  variant?: "text" | "badge";
  suffix?: string;
  className?: string;
}) {
  const flat = !value || value === 0;
  const good = flat ? null : lowerIsBetter ? value < 0 : value > 0;

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
          flat
            ? "bg-[#EEF2ED] text-muted"
            : good
              ? "bg-grn-bg text-grn-d"
              : "bg-red-bg text-red",
          className
        )}
      >
        {!flat && <TrendIcon up={value > 0} />}
        {flat ? "0" : Math.abs(value).toFixed(1)}
        {suffix}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11.5px] font-semibold tabular-nums",
        flat ? "text-muted" : good ? "text-grn-d" : "text-red",
        className
      )}
    >
      {!flat && <TrendIcon up={value > 0} />}
      {flat ? "0" : Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
