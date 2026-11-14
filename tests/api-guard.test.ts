import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const getUser = vi.fn();
vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

import { authorize, clip, parseJson, readPdfUpload, serverError } from "@/lib/api-guard";
import { resetRateLimits } from "@/lib/rate-limit";

const schema = z.object({ name: z.string().min(1) });

function jsonReq(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/x", { method: "POST", body, headers });
}

beforeEach(() => {
  resetRateLimits();
  getUser.mockReset();
  getUser.mockResolvedValue({ data: { user: null } });
});

describe("parseJson", () => {
  it("accepts valid payloads", async () => {
    const r = await parseJson(jsonReq('{"name":"a"}'), schema);
    expect(r).toEqual({ ok: true, data: { name: "a" } });
  });

  it("rejects invalid JSON and schema violations with 400", async () => {
    const bad = await parseJson(jsonReq("{nope"), schema);
    expect(!bad.ok && bad.response.status).toBe(400);
    const invalid = await parseJson(jsonReq('{"name":""}'), schema);
    expect(!invalid.ok && invalid.response.status).toBe(400);
  });

  it("rejects oversized bodies with 413", async () => {
    const big = JSON.stringify({ name: "a".repeat(200) });
    const r = await parseJson(jsonReq(big), schema, 50);
    expect(!r.ok && r.response.status).toBe(413);
  });
});

describe("authorize", () => {
  it("returns 401 without a user or guest cookie", async () => {
    const r = await authorize(jsonReq("{}"), { route: "t" });
    expect(!r.ok && r.response.status).toBe(401);
  });

  it("accepts a signed-in user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const r = await authorize(jsonReq("{}"), { route: "t" });
    expect(r).toEqual({ ok: true, caller: { kind: "user", id: "u1" } });
  });

  it("accepts a guest cookie with a stricter limit and returns 429 with Retry-After", async () => {
    const req = () => jsonReq("{}", { cookie: "a=b; guest_mode=true", "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    const first = await authorize(req(), { route: "t", guestLimit: 1 });
    expect(first).toEqual({ ok: true, caller: { kind: "guest", ip: "1.2.3.4" } });
    const second = await authorize(req(), { route: "t", guestLimit: 1 });
    expect(!second.ok && second.response.status).toBe(429);
    expect(!second.ok && second.response.headers.get("Retry-After")).toBeTruthy();
  });

  it("does not treat a lookalike cookie as guest mode", async () => {
    const r = await authorize(jsonReq("{}", { cookie: "xguest_mode=true" }), { route: "t" });
    expect(!r.ok && r.response.status).toBe(401);
  });

  it("returns 503 when the auth service throws", async () => {
    getUser.mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await authorize(jsonReq("{}"), { route: "t" });
    expect(!r.ok && r.response.status).toBe(503);
  });
});

describe("readPdfUpload", () => {
  function upload(content: BlobPart, type = "application/pdf") {
    const fd = new FormData();
    fd.set("file", new File([content], "r.pdf", { type }));
    return new Request("http://localhost/api/up", { method: "POST", body: fd });
  }

  it("accepts a real PDF header", async () => {
    const r = await readPdfUpload(upload("%PDF-1.7 data"));
    expect(r.ok).toBe(true);
  });

  it("rejects files without PDF magic bytes", async () => {
    const r = await readPdfUpload(upload("hello world"));
    expect(!r.ok && r.response.status).toBe(400);
  });

  it("rejects wrong mime types and oversized files", async () => {
    const wrong = await readPdfUpload(upload("%PDF-1", "image/png"));
    expect(!wrong.ok && wrong.response.status).toBe(400);
    const big = await readPdfUpload(upload("%PDF-" + "a".repeat(100)), 10);
    expect(!big.ok && big.response.status).toBe(413);
  });

  it("rejects a missing file", async () => {
    const req = new Request("http://localhost/api/up", { method: "POST", body: new FormData() });
    const r = await readPdfUpload(req);
    expect(!r.ok && r.response.status).toBe(400);
  });
});

describe("error helpers", () => {
  it("serverError never exposes the underlying error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = serverError("x", new Error("secret db password"));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret");
  });

  it("clip truncates strings and drops non-strings", () => {
    expect(clip("abcdef", 3)).toBe("abc");
    expect(clip(123, 3)).toBe("");
  });
});
