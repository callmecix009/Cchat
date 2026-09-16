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
    "/plan-selection",
    "/jinsi-ya-kufanya-biashara-mtandaoni-tanzania",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : route === "/jinsi-ya-kufanya-biashara-mtandaoni-tanzania" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/jinsi-ya-kufanya-biashara-mtandaoni-tanzania" ? 0.9 : route.startsWith("/sign") ? 0.6 : 0.5,
  }));
}
