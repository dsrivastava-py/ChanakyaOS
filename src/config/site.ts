/** Canonical site URL for metadata, sitemap and robots. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // fall through to the default
    }
  }
  return "http://localhost:3000";
}

/** Public marketing routes that belong in the sitemap. */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/pricing",
  "/blog",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
] as const;
