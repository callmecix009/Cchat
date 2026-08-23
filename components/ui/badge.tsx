import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "amber" | "red" | "gray" | "outline";

const VARIANT: Record<BadgeVariant, string> = {
  green: "bg-grn-bg text-grn-d border-grn-br",
  amber: "bg-amb-bg text-amber-600 border-amb-br",
  red: "bg-red-bg text-red border-red-br",
  gray: "bg-[#EEF2ED] text-[#5D7064] border-transparent",
  outline: "bg-white text-muted border-[#D2DCD1]",
};

function Badge({
  className,
  variant = "gray",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
        VARIANT[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
