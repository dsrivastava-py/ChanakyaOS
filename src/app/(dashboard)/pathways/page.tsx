"use client";

import { ArrowRight, IndianRupee, Clock, Zap, CheckCircle2, Sparkles, Loader2, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUserStore, Pathway } from "@/store/useUserStore";

interface ExplorerPathway extends Pathway {
  id?: string;
  status?: string;
}

export default function PathwayExplorer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pathways, setPathways] = useState<ExplorerPathway[]>([]);

  const fetchPathways = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('career_pathways')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(3);

      if (data && data.length > 0) {
        setPathways(data.map(p => ({
          ...p.pathway_data,
          id: p.id,
          status: p.status
        })));
      }
    } catch (error) {
      console.error("Error fetching pathways:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPathways();
  }, []);

  const { profile: currentProfileData } = useUserStore();

  const generatePathways = async () => {
    setIsGenerating(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      // 1. Delete existing active pathways
      console.log("🧹 Clearing old active pathways...");
      const { error: deleteError } = await supabase
        .from('career_pathways')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (deleteError) {
        console.error("🚨 DELETE FAILED:", deleteError.message, deleteError.code);
        throw deleteError;
      }

      // 2. Call AI
      console.log("🤖 Requesting AI strategic analysis...");
      const response = await fetch('/api/ai/generate-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: currentProfileData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚨 AI API FAILED:", errorText);
        throw new Error(`AI generation failed: ${response.status}`);
      }

      const resData = await response.json();
      const generated = resData.pathways || [];
      
      // 3. Save to Supabase
      console.log("💾 Saving new pathways to database...");
      const insertData = generated.map((pw: any) => ({
        user_id: user.id,
        pathway_name: pw.title,
        pathway_data: pw,
        compatibility_score: Math.round(Number(pw.readinessScore) || 0),
        status: 'active'
      }));
      
      const { data: insertedData, error: insertError } = await supabase
        .from('career_pathways')
        .insert(insertData)
        .select();

      if (insertError) {
        console.error("🚨 INSERT FAILED:", insertError.message, insertError.code);
        throw insertError;
      }
      
      // 4. Refresh local pathways
      if (insertedData) {
        setPathways(insertedData.map((p: any) => ({
          ...p.pathway_data,
          id: p.id,
          status: p.status
        })));
        console.log("✨ Pathways refreshed successfully!");
      }
    } catch (error: any) {
      console.error("❌ GENERATION ERROR:", error.message || error);
      alert(`Generation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLockPathway = async (pathwayId: string) => {
    try {
      const selectedPathway = pathways.find(p => p.id === pathwayId);
      if (!selectedPathway) return;

      const { lockPathway, updateReadinessScore } = useUserStore.getState();
      lockPathway(selectedPathway);
      await updateReadinessScore();

      setPathways(prev => prev.map(p => ({
        ...p,
        status: p.id === pathwayId ? 'locked' : 'active'
      })));

      alert("Pathway locked successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to lock pathway.");
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header section */}
      <header className="mb-2 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <p className="text-accent text-xs font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-accent rounded-full"></span>
            AI Pathway Explorer
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-3xl">
            {pathways.length > 0 
              ? `Strategic paths discovered.`
              : "No pathways generated yet."}
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl text-sm md:text-lg">
            Compare your tailored career pathways below. These are calculated based on your current skills and real-time market demand.
          </p>
        </div>
        
        <button 
          onClick={generatePathways}
          disabled={isGenerating}
          className="w-full lg:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] transition-all disabled:opacity-70"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isGenerating ? 'Analyzing...' : 'Refresh Pathways'}
        </button>
      </header>

      {/* Pathways Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pathways.map((path, idx) => (
            <div 
              key={path.id || idx} 
              className={`flex flex-col bg-[#111827]/75 backdrop-blur-md rounded-2xl p-6 md:p-8 relative transition-all duration-300 ${
                path.status === 'locked' 
                   ? "border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)] md:scale-[1.02]" 
                  : "border border-[#1F2937] shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-[#D4AF37]/30"
              }`}
            >
              {path.status === 'locked' && (
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#B8972A] text-[#0B0F19] text-[8px] md:text-xs font-bold uppercase tracking-wider px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] whitespace-nowrap flex items-center gap-2 z-10">
                  <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  Currently Locked
                </div>
              )}

              <div className="flex justify-between items-start mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold font-sans text-white pr-2 truncate">{path.title}</h2>
                <span className="flex items-center gap-1 bg-[#10B981]/15 text-[#10B981] px-2 md:px-3 py-1 rounded-full text-[10px] md:text-sm font-semibold border border-[#10B981]/20 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                  {path.readinessScore}%
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-400 mb-6 line-clamp-3">{path.reasoning}</p>

              <div className="space-y-3 md:space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm uppercase tracking-tighter font-bold">Timeline</span>
                  </div>
                  <span className="text-white text-xs md:text-sm font-bold">{path.timeline}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm uppercase tracking-tighter font-bold">Est. Salary</span>
                  </div>
                  <span className="text-[#D4AF37] font-bold tracking-tight text-lg md:text-xl font-data">
                    {path.salary}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => path.id && handleLockPathway(path.id)}
                disabled={path.status === 'locked'}
                className={`w-full py-3.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  path.status === 'locked'
                    ? "bg-[#1F2937] text-gray-500 cursor-default"
                    : "bg-transparent border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                }`}
              >
                {path.status === 'locked' ? 'PATHWAY LOCKED' : 'LOCK STRATEGY'}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
