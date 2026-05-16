"use client";

import { useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { parseUserName } from "@/utils/authUtils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    workspace,
    career_readiness_score,
    locked_pathway,
    user_id,
    isGuest,
    isHydrated,
    setHydrated,
    hasUnsavedChanges,
    clearUnsavedChanges,
    lms_data,
    profile,
    pinned_trends,
    lms_tasks,
    resumeData
  } = useUserStore();
  
  // The Read Effect (Run Once)
  useEffect(() => {
    const fetchInitialData = async () => {
      // GUEST MODE LOGIC
      const isGuestCookie = document.cookie.includes("guest_mode=true");
      const isFreshGuestEntry = searchParams.get("mode") === "guest";
      
      if (isGuestCookie) {
        if (isFreshGuestEntry || isGuest) {
          // Keep the guest session active
          useUserStore.setState({ 
            isGuest: true, 
            isHydrated: true,
            profile: { name: "GUEST" }
          });
          
          // Clean up the URL if we just entered
          if (isFreshGuestEntry) {
            window.history.replaceState({}, '', pathname);
          }
          return;
        } else {
          // This is a REFRESH (cookie exists but Zustand state was lost)
          // Wipe the cookie and kick to home
          document.cookie = "guest_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/";
          return;
        }
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        useUserStore.setState({ isGuest: true, isHydrated: true, profile: { name: "GUEST" } });
        return;
      }
      
      const { data } = await supabase
        .from('user_profiles')
        .select('name, lms_workspace, lms_data, career_readiness_score, pinned_trends, lms_tasks, resume_schema')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        useUserStore.setState({
          workspace: data.lms_workspace || useUserStore.getState().workspace,
          lms_data: data.lms_data || useUserStore.getState().lms_data,
          career_readiness_score: data.career_readiness_score || 0,
          pinned_trends: data.pinned_trends || [],
          lms_tasks: data.lms_tasks || [],
          profile: { name: data.name || parseUserName(user) },
          resumeData: data.resume_schema || useUserStore.getState().resumeData,
          isGuest: false,
          isHydrated: true,
          hasUnsavedChanges: false
        });
      } else {
        // Even if no profile data exists, if they have a user session, they are NOT a guest
        useUserStore.setState({ 
          isGuest: false, 
          isHydrated: true,
          profile: { name: parseUserName(user) } 
        });
      }
    };
    fetchInitialData();
  }, [isGuest, pathname]);

  // Debounce the entire relevant state by 2000ms
  const debouncedState = useDebounce({
    workspace,
    career_readiness_score,
    locked_pathway,
    lms_data,
    pinned_trends,
    lms_tasks,
    profile,
    resumeData
  }, 2000);

  const isSaving = useRef(false);

  // The Write Effect (Guarded)
  useEffect(() => {
    const saveToDatabase = async () => {
      // TASK 1: Strict guard for Guest Mode
      if (isGuest) return;

      if (!isHydrated || !hasUnsavedChanges || !debouncedState || !user_id || isSaving.current) return;
      
      isSaving.current = true;
      console.log("💾 Intentional change detected. UPSERTING to DB...");
      const supabase = createClient();
      
      try {
        // 1. Sync User Profile (Primary Table)
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user_id,
            name: debouncedState.profile?.name || "",
            lms_workspace: debouncedState.workspace,
            lms_data: debouncedState.lms_data,
            career_readiness_score: debouncedState.career_readiness_score,
            pinned_trends: debouncedState.pinned_trends,
            lms_tasks: debouncedState.lms_tasks,
            resume_schema: debouncedState.resumeData
          }, {
            onConflict: 'user_id'
          });

        if (profileError) throw profileError;

        // 2. Sync Career Pathway (Secondary Table - if locked pathway exists)
        if (debouncedState.locked_pathway) {
          const { error: pathwayError } = await supabase
            .from('career_pathways')
            .update({
              pathway_data: debouncedState.locked_pathway
            })
            .eq('user_id', user_id)
            .eq('status', 'locked');
          
          if (pathwayError) throw pathwayError;
        }

        console.log("✅ Successfully UPSERTED all data!");
        clearUnsavedChanges(); 
      } catch (error) {
        console.error("🚨 SYNC ERROR:", JSON.stringify(error, null, 2));
      } finally {
        isSaving.current = false;
      }
    };

    saveToDatabase();
  }, [debouncedState, isHydrated, hasUnsavedChanges, user_id, clearUnsavedChanges]);

  return <>{children}</>;
}
