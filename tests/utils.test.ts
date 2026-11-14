import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { parseUserName } from "@/utils/authUtils";
import { debounce } from "@/utils/debounce";
import { getSiteUrl, PUBLIC_ROUTES } from "@/config/site";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const user = (p: Partial<User>) => p as User;

describe("parseUserName", () => {
  it("returns Guest User when there is no user", () => {
    expect(parseUserName(null)).toBe("Guest User");
  });
  it("prefers the full name from metadata", () => {
    expect(parseUserName(user({ email: "a@b.com", user_metadata: { full_name: "Ada L" } }))).toBe("Ada L");
  });
  it("falls back to the email local part", () => {
    expect(parseUserName(user({ email: "ada@b.com", user_metadata: {} }))).toBe("ada");
  });
  it("falls back to Guest User when nothing is available", () => {
    expect(parseUserName(user({ user_metadata: {} }))).toBe("Guest User");
  });
});

describe("debounce", () => {
  afterEach(() => vi.useRealTimers());

  it("calls once with the last arguments after the wait", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn as (...a: unknown[]) => unknown, 100);
    d(1);
    d(2);
    d(3);
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });
});

describe("site config, sitemap and robots", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("normalizes NEXT_PUBLIC_SITE_URL to an origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://chanakya.example/some/path/");
    expect(getSiteUrl()).toBe("https://chanakya.example");
  });

  it("falls back to localhost for missing or invalid values", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not a url");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("sitemap lists every public route and no private ones", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://chanakya.example");
    const urls = sitemap().map((e) => e.url);
    expect(urls).toHaveLength(PUBLIC_ROUTES.length);
    expect(urls).toContain("https://chanakya.example");
    expect(urls).toContain("https://chanakya.example/pricing");
    expect(urls.some((u) => u.includes("/dashboard"))).toBe(false);
  });

  it("robots blocks api and app routes and points to the sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://chanakya.example");
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rules.disallow).toEqual(expect.arrayContaining(["/api/", "/dashboard", "/portfolio"]));
    expect(r.sitemap).toBe("https://chanakya.example/sitemap.xml");
  });
});
