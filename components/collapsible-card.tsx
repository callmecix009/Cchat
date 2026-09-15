"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Foldable dashboard card. Remembers open/closed per card id on this device
// so shops can trim the screen down to what they use daily.
export default function CollapsibleCard({
  id,
  title,
  desc,
  badge,
  defaultOpen = true,
  children,
  className = "",
}: {
  id: string;
  title: string;
  desc?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const key = `cchat-collapse-${id}`;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v === "0") setOpen(false);
      else if (v === "1") setOpen(true);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    setOpen((o) => {
      try {
        localStorage.setItem(key, o ? "0" : "1");
      } catch {}
      return !o;
    });
  };

  return (
    <Card className={`gap-0 ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E9E9E7]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-disp font-semibold text-[14px] text-[#111] truncate">{title}</h3>
            {badge}
          </div>
          {desc && open && <p className="text-[12px] text-[#6B6B6B] mt-0.5">{desc}</p>}
        </div>
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? `Hide ${title}` : `Show ${title}`}
          className="flex-none w-8 h-8 grid place-items-center rounded-[8px] border border-[#E9E9E7] bg-white text-[#6B6B6B] hover:text-[#111] hover:border-[#111] transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      {open && <CardContent className="p-0">{children}</CardContent>}
    </Card>
  );
}
