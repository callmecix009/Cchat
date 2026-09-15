"use client";

import { initials } from "@/lib/demo";

// Shared product photo thumb. Shows the uploaded photo when present,
// otherwise falls back to the emoji/initials tile. Used everywhere a
// product appears: catalog table, stock alerts, inbox sale picker.
export default function ProductThumb({
  image,
  emoji,
  name,
  cl,
  size = 42,
  radius = 10,
}: {
  image?: string | null;
  emoji?: string;
  name: string;
  cl?: string;
  size?: number;
  radius?: number;
}) {
  const style = {
    width: size,
    height: size,
    borderRadius: radius,
    background: image ? "#F7F7F5" : cl || "#E3F4E9",
  } as const;
  if (image) {
    return (
      <span
        className="overflow-hidden flex-none border border-[#E9E9E7] bg-white"
        style={style}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }
  return (
    <span
      className="flex items-center justify-center flex-none font-semibold text-[#111]"
      style={{ ...style, fontSize: Math.max(13, Math.round(size * 0.42)) }}
      aria-hidden
    >
      {emoji || initials(name) || "📦"}
    </span>
  );
}
