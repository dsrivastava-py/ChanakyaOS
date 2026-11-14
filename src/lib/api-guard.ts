import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

/** JSON error response that never includes internal error details. */
export function jsonError(message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers });
}

/** Log the real error server-side and return a generic 500 to the client. */
export function serverError(label: string, error: unknown, message = "Something went wrong. Please try again.") {
  console.error(`[${label}]`, error);
  return jsonError(message, 500);
}

export interface GuardOptions {
  /** Route name used as the rate limit namespace. */
  route: string;
  /** Max requests per window for signed-in users. */
  limit?: number;
  /** Max requests per window for guests (stricter). */
  guestLimit?: number;
  windowMs?: number;
  /** Max request body size in bytes (JSON routes). */
  maxBytes?: number;
}

export type Caller = { kind: "user"; id: string } | { kind: "guest"; ip: string };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function hasGuestCookie(req: Request): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  return /(?:^|;\s*)guest_mode=true(?:;|$)/.test(cookie);
}

/**
 * Authenticate and rate limit a request.
 * The guest_mode cookie is client-settable, so it only unlocks the stateless
 * AI features (PRD guest mode) under a much stricter per-IP limit. It never
 * grants access to stored user data.
 */
export async function authorize(
  req: Request,
  opts: GuardOptions
): Promise<{ ok: true; caller: Caller } | { ok: false; response: NextResponse }> {
  const windowMs = opts.windowMs ?? 60_000;
  let caller: Caller | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) caller = { kind: "user", id: user.id };
  } catch (error) {
    console.error(`[${opts.route}] auth check failed`, error);
    return { ok: false, response: jsonError("Authentication service unavailable", 503) };
  }

  if (!caller && hasGuestCookie(req)) {
    caller = { kind: "guest", ip: clientIp(req) };
  }

  if (!caller) {
    return { ok: false, response: jsonError("Authentication required", 401) };
  }

  const limit = caller.kind === "guest" ? opts.guestLimit ?? 5 : opts.limit ?? 20;
  const key = `${opts.route}:${caller.kind === "guest" ? `ip:${caller.ip}` : `user:${caller.id}`}`;
  const result = rateLimit(key, limit, windowMs);
  if (!result.allowed) {
    return {
      ok: false,
      response: jsonError("Too many requests. Please slow down and try again shortly.", 429, {
        "Retry-After": String(result.retryAfterSeconds),
      }),
    };
  }

  return { ok: true, caller };
}

/** Read, size-limit, parse and validate a JSON body. */
export async function parseJson<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
  maxBytes = 100_000
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: NextResponse }> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes) {
    return { ok: false, response: jsonError("Request body too large", 413) };
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return { ok: false, response: jsonError("Invalid request body", 400) };
  }
  if (raw.length > maxBytes) {
    return { ok: false, response: jsonError("Request body too large", 413) };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400) };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, response: jsonError("Invalid request payload", 400) };
  }
  return { ok: true, data: parsed.data };
}

/** Authorize then validate JSON. Convenience for AI routes. */
export async function guardJson<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
  opts: GuardOptions
): Promise<{ ok: true; data: z.infer<S>; caller: Caller } | { ok: false; response: NextResponse }> {
  const auth = await authorize(req, opts);
  if (!auth.ok) return auth;
  const body = await parseJson(req, schema, opts.maxBytes);
  if (!body.ok) return body;
  return { ok: true, data: body.data, caller: auth.caller };
}

/** Validate an uploaded PDF (size, type, magic bytes). Returns the buffer. */
export async function readPdfUpload(
  req: Request,
  maxBytes = 5 * 1024 * 1024
): Promise<{ ok: true; buffer: Buffer } | { ok: false; response: NextResponse }> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > maxBytes + 64 * 1024) {
    return { ok: false, response: jsonError("File too large (max 5MB)", 413) };
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return { ok: false, response: jsonError("Invalid upload", 400) };
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { ok: false, response: jsonError("No file provided", 400) };
  }
  if (file.size > maxBytes) {
    return { ok: false, response: jsonError("File too large (max 5MB)", 413) };
  }
  if (file.type && !file.type.includes("pdf")) {
    return { ok: false, response: jsonError("File must be a PDF", 400) };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { ok: false, response: jsonError("File must be a PDF", 400) };
  }
  return { ok: true, buffer };
}

/** Cap a string, used when interpolating user text into prompts. */
export function clip(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}
