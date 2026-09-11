import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cchat.site";

  const routes = [
    "",
    "/privacy",
    "/terms",
    "/acceptable-use",
    "/sign-in",
    "/sign-up",
    "/onboarding",
    "/plan-selection",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/sign") ? 0.6 : 0.5,
  }));
}
