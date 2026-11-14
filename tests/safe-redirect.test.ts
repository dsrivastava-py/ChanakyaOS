import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeRedirectPath("/pathways")).toBe("/pathways");
    expect(safeRedirectPath("/lms?tab=1#x")).toBe("/lms?tab=1#x");
  });

  it("falls back for missing values", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
    expect(safeRedirectPath("")).toBe("/dashboard");
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com/path",
    "/ok\r\nLocation: x",
    "/a\\b",
  ])("rejects %j", (bad) => {
    expect(safeRedirectPath(bad)).toBe("/dashboard");
  });

  it("rejects very long paths and honours a custom fallback", () => {
    expect(safeRedirectPath("/" + "a".repeat(600))).toBe("/dashboard");
    expect(safeRedirectPath("https://x.com", "/home")).toBe("/home");
  });
});
