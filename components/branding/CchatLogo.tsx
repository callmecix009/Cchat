import React from "react";

type CchatLogoProps = {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
  decorative?: boolean; // true when adjacent text already says "C-chat"
};

export default function CchatLogo({
  size = 48,
  className = "",
  title = "C-chat",
  animated = false,
  decorative = false,
}: CchatLogoProps) {
  const numericSize = typeof size === "number" ? size : parseInt(String(size), 10) || 48;
  return (
    // Centralized C-chat logo asset: public/images/c-chat-logo.png (official)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/c-chat-logo.png"
      width={numericSize}
      height={numericSize}
      alt={decorative ? "" : title}
      className={`${className} ${animated ? "cchat-logo-animated" : ""} object-contain shrink-0`}
      style={{ width: numericSize, height: numericSize }}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  );
}