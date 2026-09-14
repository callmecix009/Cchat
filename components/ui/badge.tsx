import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "amber" | "red" | "gray" | "outline";

const VARIANT: Record<BadgeVariant, string> = {
  green: "bg-[#F1F1EF] text-[#111] border-[#E9E9E7]",
  amber: "bg-[#F7F7F5] text-[#6B6B6B] border-[#E9E9E7]",
  red: "bg-[#F1F1EF] text-[#6B6B6B] border-[#E9E9E7]",
  gray: "bg-[#F7F7F5] text-[#6B6B6B] border-[#E9E9E7]",
  outline: "bg-white text-[#6B6B6B] border-[#E9E9E7]",
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
