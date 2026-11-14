import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminEnv, getAiEnv, getPublicEnv } from "@/config/env";

afterEach(() => vi.unstubAllEnvs());

describe("env validation", () => {
  it("returns public env when valid", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });
  });

  it("throws a clear error for a missing or invalid public env", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(() => getPublicEnv()).toThrow(/Invalid environment configuration/);
    expect(() => getPublicEnv()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("requires GROQ_API_KEY but not GEMINI_API_KEY", () => {
    vi.stubEnv("GROQ_API_KEY", "g");
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(getAiEnv().GROQ_API_KEY).toBe("g");
    vi.stubEnv("GROQ_API_KEY", "");
    expect(() => getAiEnv()).toThrow(/GROQ_API_KEY/);
  });

  it("requires the service role key for admin env", () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(() => getAdminEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "svc");
    expect(getAdminEnv().SUPABASE_SERVICE_ROLE_KEY).toBe("svc");
  });

  it("does not leak secret values in error messages", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "super-secret-bad-value");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "x");
    expect(() => getPublicEnv()).not.toThrow(/super-secret-bad-value/);
  });
});
