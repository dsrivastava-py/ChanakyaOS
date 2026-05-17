import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    });

    if (error) {
      console.error("Check user error listing:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const exists = users.some(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    
    console.log(`🔍 [API check-user] Email: "${email}" -> exists: ${exists}`);

    return NextResponse.json({ exists });
  } catch (err: any) {
    console.error("Check user unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
