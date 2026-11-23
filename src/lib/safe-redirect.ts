/**
 * Return `target` only if it is a same-origin relative path, otherwise the
 * fallback. Blocks open redirects such as `//evil.com`, `/\evil.com`,
 * `https://evil.com` and `javascript:` URLs.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = "/dashboard"): string {
  if (!target || typeof target !== "string") return fallback;
  if (target.length > 500) return fallback;
  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback;
  // Reject control characters and backslashes that browsers may normalize into "//"
  if (/[\u0000-\u001f\\]/.test(target)) return fallback;
  return target;
}
