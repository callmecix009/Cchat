import React, { useId } from "react";

type CchatLogoProps = {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
  decorative?: boolean; // true when adjacent text already says "cchat"
};

export default function CchatLogo({
  size = 48,
  className = "",
  title = "Cchat",
  animated = false,
  decorative = false,
}: CchatLogoProps) {
  const uid = useId();
  const gradC = `${uid}-cchat-grad-c`;
  const gradBack = `${uid}-cchat-grad-back`;
  const gradFront = `${uid}-cchat-grad-front`;
  const gradDot = `${uid}-cchat-grad-dot`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="25 79 436 331"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? "cchat-logo-animated" : ""}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradC} x1="140" y1="170" x2="190" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B4FF45" />
          <stop offset="45%" stopColor="#39E61D" />
          <stop offset="100%" stopColor="#00894F" />
        </linearGradient>
        <linearGradient id={gradBack} x1="260" y1="90" x2="450" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8FE881" />
          <stop offset="100%" stopColor="#2BB673" />
        </linearGradient>
        <linearGradient id={gradFront} x1="200" y1="150" x2="420" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A3F94F" />
          <stop offset="45%" stopColor="#39E61D" />
          <stop offset="100%" stopColor="#00894F" />
        </linearGradient>
        <radialGradient id={gradDot} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1FAE8" />
        </radialGradient>
      </defs>

      {/* BACK BUBBLE (top-right, partially hidden) */}
      <g>
        <ellipse cx="345" cy="185" rx="112" ry="102" fill={`url(#${gradBack})`} />
        <path d="M425 255 L448 305 L392 280 Z" fill={`url(#${gradBack})`} />
      </g>

      {/* LETTER C with tail sweeping under the bubble */}
      <path
        d="M216 210 C198 188 170 176 142 180 C90 188 56 236 64 288 C72 340 120 374 172 366 C196 362 216 350 230 332"
        stroke={`url(#${gradC})`}
        strokeWidth="54"
        strokeLinecap="round"
        fill="none"
      />

      {/* FRONT BUBBLE with two feet */}
      <g>
        <path d="M228 352 L206 406 L270 374 Z" fill={`url(#${gradFront})`} />
        <path d="M368 352 L390 406 L326 374 Z" fill={`url(#${gradFront})`} />
        <ellipse cx="298" cy="262" rx="126" ry="116" fill={`url(#${gradFront})`} />
      </g>

      {/* Glossy top highlight */}
      <path
        d="M212 200 C230 162 264 140 300 138"
        stroke="#E9FFC9"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />

      {/* THREE DOTS */}
      <circle cx="250" cy="262" r="17" fill={`url(#${gradDot})`} />
      <circle cx="300" cy="262" r="17" fill={`url(#${gradDot})`} />
      <circle cx="350" cy="262" r="17" fill={`url(#${gradDot})`} />
    </svg>
  );
}