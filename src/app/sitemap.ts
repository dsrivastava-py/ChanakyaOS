import type { MetadataRoute } from "next";
import { getSiteUrl, PUBLIC_ROUTES } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return PUBLIC_ROUTES.map((route) => ({
    url: route === "/" ? base : `${base}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.6,
  }));
}
