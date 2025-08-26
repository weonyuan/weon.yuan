import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/experience`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/notes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}