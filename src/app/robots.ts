import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/lms",
        "/pathways",
        "/resume",
        "/linkedin",
        "/trends",
        "/diagnosis",
        "/skills-gap",
        "/assistant",
        "/profile",
        "/portfolio",
        "/onboarding",
        "/login",
        "/signup",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
