import React from "react";

type BadgeProps = {
  size?: number | string;
  className?: string;
  label?: string;
};

/**
 * Premium badge — scalloped gold starburst, crown, green ribbon, laurel.
 * Visual reference: user-provided "PREMIUM MEMBER" badge (Image 1).
 */
export function PremiumBadge({ size = 96, className = "", label = "Premium member" }: BadgeProps) {
  const uid = React.useId().replace(/:/g, "");
  const gold = `pb-gold-${uid}`;
  const goldDark = `pb-gold-d-${uid}`;
  const ribbon = `pb-rib-${uid}`;
  const spikes = 28;
  const cx = 100;
  const cy = 100;
  const rOuter = 96;
  const rInner = 82;
  let starPath = "";
  for (let i = 0; i < spikes; i++) {
    const a1 = (i / spikes) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / spikes) * Math.PI * 2 - Math.PI / 2;
    starPath += `${i === 0 ? "M" : "L"}${(cx + rOuter * Math.cos(a1)).toFixed(2)} ${(cy + rOuter * Math.sin(a1)).toFixed(2)} L${(cx + rInner * Math.cos(a2)).toFixed(2)} ${(cy + rInner * Math.sin(a2)).toFixed(2)} `;
  }
  starPath += "Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <linearGradient id={gold} x1="40" y1="30" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0C75E" />
          <stop offset="55%" stopColor="#DFA92B" />
          <stop offset="100%" stopColor="#C98F1B" />
        </linearGradient>
        <linearGradient id={goldDark} x1="60" y1="40" x2="150" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E7B845" />
          <stop offset="100%" stopColor="#D19A20" />
        </linearGradient>
        <linearGradient id={ribbon} x1="30" y1="88" x2="170" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1FA864" />
          <stop offset="100%" stopColor="#0E7A47" />
        </linearGradient>
      </defs>

      <path d={starPath} fill={`url(#${goldDark})`} />
      <circle cx={cx} cy={cy} r={rInner} fill={`url(#${gold})`} />
      <circle cx={cx} cy={cy} r={rInner - 7} fill="none" stroke="#B8860B" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* crown */}
      <path
        d="M78 66 L86 82 L100 62 L114 82 L122 66 L126 90 L74 90 Z"
        fill="#FDF9EE"
      />
      <rect x="74" y="92" width="52" height="5" rx="2.5" fill="#FDF9EE" />

      {/* laurel */}
      <g fill="#FDF9EE" opacity="0.95">
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(200,0) scale(-1,1)" : undefined}>
            <path d="M62 128 C58 142 62 156 74 164 C70 152 70 140 74 130 C70 128 66 127 62 128 Z" />
            <ellipse cx="66" cy="138" rx="6" ry="2.6" transform="rotate(-38 66 138)" />
            <ellipse cx="63" cy="147" rx="6" ry="2.6" transform="rotate(-20 63 147)" />
            <ellipse cx="63" cy="156" rx="6" ry="2.6" transform="rotate(-4 63 156)" />
            <ellipse cx="67" cy="163" rx="6" ry="2.6" transform="rotate(14 67 163)" />
          </g>
        ))}
      </g>

      {/* ribbon */}
      <path d="M14 96 L38 90 L38 132 L14 126 L24 111 Z" fill="#0E7A47" />
      <path d="M186 96 L162 90 L162 132 L186 126 L176 111 Z" fill="#0E7A47" />
      <rect x="30" y="88" width="140" height="40" rx="4" fill={`url(#${ribbon})`} />
      <text
        x="100" y="112"
        textAnchor="middle"
        style={{ font: "800 21px var(--disp, sans-serif)", letterSpacing: "0.04em" }}
        fill="#FDF9EE"
      >
        PREMIUM
      </text>
      <text
        x="100" y="126"
        textAnchor="middle"
        style={{ font: "700 10px var(--body, sans-serif)", letterSpacing: "0.28em" }}
        fill="#EAF9F0"
      >
        MEMBER
      </text>
    </svg>
  );
}

/**
 * Extra Premium badge — gold sunburst rays, crown outline, deep green ribbon, laurel.
 * Visual reference: user-provided "EXTRA PREMIUM MEMBER" badge (Image 2).
 */
export function ExtraPremiumBadge({ size = 96, className = "", label = "Extra Premium member" }: BadgeProps) {
  const uid = React.useId().replace(/:/g, "");
  const gold = `ep-gold-${uid}`;
  const rays = `ep-rays-${uid}`;
  const ribbon = `ep-rib-${uid}`;
  const cx = 100;
  const cy = 104;
  let raysPath = "";
  const rayCount = 20;
  for (let i = 0; i < rayCount; i++) {
    const a = (i / rayCount) * Math.PI * 2 - Math.PI / 2;
    const w = 0.055;
    const x1 = (cx + 96 * Math.cos(a - w)).toFixed(2);
    const y1 = (cy + 96 * Math.sin(a - w)).toFixed(2);
    const x2 = (cx + 96 * Math.cos(a + w)).toFixed(2);
    const y2 = (cy + 96 * Math.sin(a + w)).toFixed(2);
    const tx = (cx + 99 * Math.cos(a)).toFixed(2);
    const ty = (cy + 99 * Math.sin(a)).toFixed(2);
    raysPath += `M${x1} ${y1} L${tx} ${ty} L${x2} ${y2} Z `;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        <linearGradient id={gold} x1="40" y1="30" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3D271" />
          <stop offset="50%" stopColor="#DFA92B" />
          <stop offset="100%" stopColor="#C08718" />
        </linearGradient>
        <linearGradient id={rays} x1="40" y1="30" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E9BE4E" />
          <stop offset="100%" stopColor="#C89420" />
        </linearGradient>
        <linearGradient id={ribbon} x1="20" y1="88" x2="180" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#128A55" />
          <stop offset="100%" stopColor="#075A37" />
        </linearGradient>
      </defs>

      <path d={raysPath} fill={`url(#${rays})`} />
      <circle cx={cx} cy={cy} r={72} fill={`url(#${gold})`} />

      {/* crown outline */}
      <path
        d="M80 56 L88 70 L100 52 L112 70 L120 56 L123 74 L77 74 Z"
        fill="none"
        stroke="#FDF9EE"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* laurel */}
      <g fill="#FDF9EE" opacity="0.95">
        {[0, 1].map((side) => (
          <g key={side} transform={side ? "translate(200,0) scale(-1,1)" : undefined}>
            <path d="M64 132 C60 146 64 158 76 166 C72 154 72 144 76 134 C72 132 68 131 64 132 Z" />
            <ellipse cx="68" cy="142" rx="6" ry="2.6" transform="rotate(-38 68 142)" />
            <ellipse cx="65" cy="151" rx="6" ry="2.6" transform="rotate(-20 65 151)" />
            <ellipse cx="65" cy="160" rx="6" ry="2.6" transform="rotate(-4 65 160)" />
          </g>
        ))}
      </g>

      {/* ribbon */}
      <path d="M8 94 L34 87 L34 133 L8 126 L19 110 Z" fill="#075A37" />
      <path d="M192 94 L166 87 L166 133 L192 126 L181 110 Z" fill="#075A37" />
      <rect x="24" y="86" width="152" height="42" rx="4" fill={`url(#${ribbon})`} />
      <text
        x="100" y="108"
        textAnchor="middle"
        style={{ font: "800 19px var(--disp, sans-serif)", letterSpacing: "0.03em" }}
        fill="#FDF9EE"
      >
        EXTRA
      </text>
      <text
        x="100" y="124"
        textAnchor="middle"
        style={{ font: "800 17px var(--disp, sans-serif)", letterSpacing: "0.05em" }}
        fill="#FDF9EE"
      >
        PREMIUM
      </text>
    </svg>
  );
}

/** Small inline badge used in the sidebar / compact spots. */
export function MiniPlanBadge({ kind, size = 34 }: { kind: "premium" | "extra"; size?: number }) {
  return kind === "extra"
    ? <ExtraPremiumBadge size={size} />
    : <PremiumBadge size={size} />;
}
