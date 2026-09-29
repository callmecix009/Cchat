import type { MetadataRoute } from "next";

// Public, indexable pages only. Auth-gated routes (sign-in, sign-up,
// plan-selection, onboarding, dashboard, settings, billing) are intentionally
// excluded — Google can't crawl them and they waste crawl budget.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cchat.site";
  const now = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/jinsi-ya-kufanya-biashara-mtandaoni-tanzania`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/privacy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/terms`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/acceptable-use`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
