import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit then blocks", () => {
    expect(rateLimit("k", 2, 1000, 0).allowed).toBe(true);
    expect(rateLimit("k", 2, 1000, 1).allowed).toBe(true);
    const third = rateLimit("k", 2, 1000, 2);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBe(1);
  });

  it("reports remaining requests", () => {
    expect(rateLimit("k", 3, 1000, 0).remaining).toBe(2);
    expect(rateLimit("k", 3, 1000, 1).remaining).toBe(1);
  });

  it("resets after the window", () => {
    rateLimit("k", 1, 1000, 0);
    expect(rateLimit("k", 1, 1000, 500).allowed).toBe(false);
    expect(rateLimit("k", 1, 1000, 1000).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("a", 1, 1000, 1).allowed).toBe(false);
    expect(rateLimit("b", 1, 1000, 1).allowed).toBe(true);
  });

  it("computes retry-after from the remaining window", () => {
    rateLimit("k", 1, 10_000, 0);
    expect(rateLimit("k", 1, 10_000, 3_000).retryAfterSeconds).toBe(7);
  });
});
