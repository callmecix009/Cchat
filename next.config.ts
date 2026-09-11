import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a Next.js App Router app (SSR + API routes), NOT a static SPA.
  // DO NOT add a catch-all rewrite like { source: "/:path*", destination: "/index.html" }.
  // That pattern is only for Vite/CRA static exports and would break Next.js
  // filesystem routing, API routes (/api/*), and asset serving (_next/*, /images/*).
  // Next.js handles client-side navigation via next/link with automatic prefetch
  // and preserves URL state — no SPA fallback needed on Vercel/hosting.
};

export default nextConfig;
