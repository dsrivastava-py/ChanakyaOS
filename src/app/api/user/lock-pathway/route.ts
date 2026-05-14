import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { pathway } = await req.json();

    const { data: { user } } = await supabase.auth.getUser();
    
    // DEV BYPASS: Allow proceeding without auth during development
    let userId = user?.id;
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Auth failed: Using development fallback user ID.");
        userId = "00000000-0000-0000-0000-000000000000"; 
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 1. Mark existing pathways for this user as 'active'
    await supabase
      .from("career_pathways")
      .update({ status: "active" })
      .eq("user_id", userId);

    // 2. Insert the new pathway as 'locked'
    const { data, error } = await supabase
      .from("career_pathways")
      .insert({
        user_id: userId,
        pathway_name: pathway.title,
        pathway_data: pathway,
        compatibility_score: pathway.readinessScore,
        status: "locked",
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      // In dev, we might not have the table setup, so we still return success to allow UI progress
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, mock: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Update user profile
    await supabase
      .from("user_profiles")
      .update({ 
        career_readiness_score: pathway.readinessScore,
      })
      .eq("user_id", userId);

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error("Lock pathway error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
