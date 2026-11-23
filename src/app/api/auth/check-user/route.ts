import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJson, serverError } from "@/lib/api-guard";
import { getAdminEnv, getPublicEnv } from "@/config/env";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ email: z.string().trim().email().max(254) });

// Safety cap so a huge user base cannot cause unbounded paging.
const PER_PAGE = 1000;
const MAX_PAGES = 20;

export async function POST(request: Request) {
  try {
    // Unauthenticated by design (used on the signup form), so limit per IP to
    // slow down account enumeration.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limited = rateLimit(`checkUser:${ip}`, 10, 60_000);
    if (!limited.allowed) {
      return jsonError("Too many requests. Please try again shortly.", 429, {
        "Retry-After": String(limited.retryAfterSeconds),
      });
    }

    const body = await parseJson(request, bodySchema, 2_000);
    if (!body.ok) return body.response;
    const target = body.data.email.toLowerCase();

    const supabaseAdmin = createClient(
      getPublicEnv().NEXT_PUBLIC_SUPABASE_URL,
      getAdminEnv().SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let exists = false;
    for (let page = 1; page <= MAX_PAGES && !exists; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: PER_PAGE });
      if (error) {
        return serverError("checkUser", error, "Could not verify email");
      }
      const users = data?.users ?? [];
      exists = users.some((u) => u.email?.toLowerCase() === target);
      if (users.length < PER_PAGE) break;
    }

    return NextResponse.json({ exists });
  } catch (err: unknown) {
    return serverError("checkUser", err, "Could not verify email");
  }
}
