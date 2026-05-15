"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import {
  Sparkles,
  Briefcase as LinkedinIcon,
  Target,
  User,
  Code2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Eye,
  Search
} from "lucide-react";

interface OptimizationSuggestion {
  type: "headline" | "summary" | "skills";
  priority: "high" | "medium" | "low";
  current: string;
  suggested: string;
  explanation: string;
}

export default function LinkedinOptimizer() {
  const { linkedin_health_score, locked_pathway, session, user_id, setEditProfileModalOpen } = useUserStore();
  const supabase = createClient();

  const [activeSection, setActiveSection] = useState<"headline" | "summary" | "skills">("headline");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    headline: string;
    summary: string;
    skills: string[];
  } | null>(null);

  // Load saved profile data from Supabase
  useEffect(() => {
    const loadLinkedInData = async () => {
      if (!user_id) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('linkedin_data')
        .eq('user_id', user_id)
        .maybeSingle();

      if (data?.linkedin_data) {
        setProfileData(data.linkedin_data);
      }
    };
    loadLinkedInData();
  }, [user_id, supabase]);

  // Save profile data to Supabase
  const saveLinkedInData = async () => {
    if (!user_id) return;
    setIsSaving(true);
    try {
      await supabase
        .from('user_profiles')
        .update({
          linkedin_data: profileData,
          linkedin_health_score: calculateHealthScore()
        })
        .eq('user_id', user_id);
    } catch (err) {
      console.error("Error saving LinkedIn data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate health score based on profile completeness
  const calculateHealthScore = () => {
    let score = 0;
    if (profileData.headline && profileData.headline.length > 10) score += 25;
    if (profileData.summary && profileData.summary.length > 100) score += 25;
    if (profileData.skills && profileData.skills.length >= 5) score += 25;
    if (locked_pathway?.skillChecklist) {
      const matchedSkills = profileData.skills.filter(s =>
        locked_pathway.skillChecklist.some(ps => ps.skill.toLowerCase().includes(s.toLowerCase()))
      );
      score += Math.min(25, matchedSkills.length * 5);
    }
    return Math.min(100, score);
  };

  // Profile data state
  const [profileData, setProfileData] = useState({
    headline: "Aspiring Data Analyst",
    summary: "Passionate about data analytics and visualization. Currently learning Python and SQL.",
    currentRole: "",
    targetRole: "Data Analyst",
    skills: ["Excel", "PowerPoint", "Communication"]
  });

  // Update targetRole when locked_pathway changes
  useEffect(() => {
    if (locked_pathway?.title) {
      setProfileData(prev => ({ ...prev, targetRole: locked_pathway.title }));
    }
  }, [locked_pathway]);

  const circumference = 251.2;
  const progressOffset = circumference - (linkedin_health_score / 100) * circumference;

  // Analyze profile and generate suggestions
  const analyzeProfile = () => {
    const suggestions: OptimizationSuggestion[] = [];

    // Headline analysis
    const hasTargetRole = profileData.headline.toLowerCase().includes(profileData.targetRole.toLowerCase());
    const hasSkills = profileData.headline.toLowerCase().includes("data") || profileData.headline.toLowerCase().includes("analytics");

    if (!hasTargetRole) {
      suggestions.push({
        type: "headline",
        priority: "high",
        current: profileData.headline,
        suggested: `${profileData.targetRole} | Data Analytics Enthusiast | Python & SQL`,
        explanation: "Include your target role and key skills in the headline for better discoverability"
      });
    }

    // Summary analysis
    if (profileData.summary.length < 100) {
      suggestions.push({
        type: "summary",
        priority: "high",
        current: profileData.summary,
        suggested: `Driven ${profileData.targetRole} with a strong foundation in data analysis and visualization. Passionate about transforming raw data into actionable insights using Python, SQL, and Tableau. Currently building expertise through practical projects and certifications.`,
        explanation: "Write a compelling 200+ character summary that highlights your transition and key skills"
      });
    }

    // Skills analysis
    const targetSkills = locked_pathway?.skillChecklist.filter(s => s.status === "missing").map(s => s.skill) || [];
    const missingSkills = targetSkills.slice(0, 5);

    if (missingSkills.length > 0) {
      suggestions.push({
        type: "skills",
        priority: "medium",
        current: profileData.skills.join(", "),
        suggested: [...profileData.skills, ...missingSkills].slice(0, 15).join(", "),
        explanation: `Add these in-demand skills: ${missingSkills.join(", ")}`
      });
    }

    return suggestions;
  };

  const handleGenerateOptimization = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setGeneratedContent({
      headline: `${profileData.targetRole} | Data-Driven Professional | Python, SQL, Tableau`,
      summary: `Passionate ${profileData.targetRole} with expertise in data visualization and analysis. Proven ability to transform complex datasets into actionable insights using Python, SQL, and BI tools. Committed to continuous learning and delivering data-driven solutions that drive business growth.`,
      skills: [...profileData.skills, ...(locked_pathway?.skillChecklist.filter(s => s.status === "missing").slice(0, 5).map(s => s.skill) || [])].slice(0, 15)
    });

    setIsGenerating(false);
  };

  const suggestions = analyzeProfile();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#10B981]";
    if (score >= 60) return "text-[#D4AF37]";
    return "text-red-400";
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-20">
      <header className="mb-2">
        <p className="text-[#0077B5] text-xs md:text-sm font-bold tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
          <LinkedinIcon className="w-3.5 h-3.5" />
          LinkedIn Strategic Optimizer
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
          Stand out to <span className="text-[#0077B5]">Top Recruiters</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Ring */}
        <div className="lg:col-span-1 bg-[#111827]/75 backdrop-blur-md border border-[#0077B5]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center">
          <h2 className="text-base md:text-lg font-semibold text-white mb-6 md:mb-8 self-start w-full flex items-center gap-2">
            <Eye className="w-4 h-4 md:w-5 md:h-5 text-[#0077B5]" />
            Profile Health
          </h2>
          <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="40"
                stroke="#0077B5"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl md:text-5xl font-bold ${getScoreColor(linkedin_health_score)}`}>
                {linkedin_health_score}<span className="text-xl md:text-3xl text-gray-400">%</span>
              </span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-400 text-center leading-relaxed">
            {linkedin_health_score >= 80
              ? "Excellent! Your profile is recruiter-ready"
              : linkedin_health_score >= 60
                ? "Good profile. Add keywords for visibility"
                : "Needs optimization to attract recruiters"}
          </p>
        </div>

        {/* Optimization Actions */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Profile Input Section */}
          <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-2xl p-5 md:p-6">
            <h3 className="text-white text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#0077B5]" />
              Strategic Profile Data
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block font-bold">Headline</label>
                <input
                  value={profileData.headline}
                  onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:border-[#0077B5]/50 outline-none transition-all"
                  placeholder="Your current headline"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block font-bold">Summary (About)</label>
                <textarea
                  value={profileData.summary}
                  onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:border-[#0077B5]/50 outline-none resize-none h-24 md:h-28 transition-all"
                  placeholder="Your About section"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block font-bold">Skills</label>
                <input
                  value={profileData.skills.join(", ")}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:border-[#0077B5]/50 outline-none transition-all"
                  placeholder="React, Python, SQL..."
                />
              </div>
            </div>
          </div>

          {/* AI Generation & Save Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGenerateOptimization}
              disabled={isGenerating}
              className="flex-1 py-4 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,119,181,0.3)] transition-all disabled:opacity-50 text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Optimization
                </>
              )}
            </button>
            <button
              onClick={saveLinkedInData}
              disabled={isSaving}
              className="sm:w-32 py-4 bg-[#111827] border border-[#1F2937] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-[#0077B5]/50 transition-all disabled:opacity-50 text-sm"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Save
            </button>
          </div>

          {/* Generated Content Preview */}
          {generatedContent && (
            <div className="bg-[#111827]/75 backdrop-blur-md border border-[#0077B5]/30 rounded-2xl p-5 md:p-6 space-y-4 shadow-[0_0_40px_rgba(0,119,181,0.1)]">
              <h3 className="text-white font-semibold flex items-center gap-2 text-sm md:text-base">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#10B981]" />
                AI Generated Recommendations
              </h3>

              {/* Section Tabs */}
              <div className="flex flex-wrap gap-2">
                {(["headline", "summary", "skills"] as const).map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      activeSection === section
                        ? "bg-[#0077B5] border-[#0077B5] text-white shadow-[0_0_15px_rgba(0,119,181,0.3)]"
                        : "bg-[#0B0F19] border-[#1F2937] text-gray-500 hover:text-white"
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>

              {/* Content Display */}
              <div className="bg-[#0B0F19] border border-[#1F2937] rounded-xl p-5 md:p-6">
                {activeSection === "headline" && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Optimized Headline</span>
                      <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded font-bold">HIGH IMPACT</span>
                    </div>
                    <p className="text-white font-semibold text-sm md:text-lg mb-4 leading-relaxed">{generatedContent.headline}</p>
                    <div className="p-4 bg-[#1F2937]/30 rounded-xl border border-white/5">
                      <p className="text-[10px] md:text-xs text-gray-400 italic">"{suggestions.find(s => s.type === "headline")?.explanation}"</p>
                    </div>
                  </div>
                )}

                {activeSection === "summary" && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Optimized Summary</span>
                      <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded font-bold">HIGH IMPACT</span>
                    </div>
                    <p className="text-white text-xs md:text-sm leading-relaxed mb-4">{generatedContent.summary}</p>
                    <div className="p-4 bg-[#1F2937]/30 rounded-xl border border-white/5">
                      <p className="text-[10px] md:text-xs text-gray-400 italic">"{suggestions.find(s => s.type === "summary")?.explanation}"</p>
                    </div>
                  </div>
                )}

                {activeSection === "skills" && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Market Skills</span>
                      <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded font-bold">KEYWORD READY</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {generatedContent.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold ${
                            profileData.skills.includes(skill)
                              ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                              : "bg-[#0077B5]/10 text-[#0077B5] border border-[#0077B5]/20"
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="p-4 bg-[#1F2937]/30 rounded-xl border border-white/5">
                      <p className="text-[10px] md:text-xs text-gray-400 italic">"{suggestions.find(s => s.type === "skills")?.explanation}"</p>
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full py-3.5 border border-[#0077B5]/40 text-[#0077B5] rounded-xl font-bold text-xs hover:bg-[#0077B5]/10 transition-all flex items-center justify-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                APPLY ON LINKEDIN
              </button>
            </div>
          )}

          {/* Improvement Cards */}
          <div className="space-y-4">
            <div className="bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center transition-all hover:border-[#D4AF37]/40">
              <div className="flex gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                  <Target className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Rewrite Headline</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Inject high-impact keywords like "{profileData.targetRole}" and relevant skillsets.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { handleGenerateOptimization(); setActiveSection("headline"); }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors font-bold text-[10px] md:text-xs tracking-wider uppercase"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Optimize
              </button>
            </div>

            <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center transition-all hover:border-gray-700">
              <div className="flex gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Optimize Summary</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Draft a compelling narrative about your transition into {profileData.targetRole}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { handleGenerateOptimization(); setActiveSection("summary"); }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-colors font-bold text-[10px] md:text-xs tracking-wider uppercase"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Draft AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Research Section */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-2xl p-5 md:p-6">
        <h3 className="text-white text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 md:w-5 md:h-5 text-[#0077B5]" />
          Recruiter Keyword Cloud
        </h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          High-demand keywords for <span className="text-white font-bold">{profileData.targetRole}</span> in the current market. Click to add:
        </p>
        <div className="flex flex-wrap gap-2">
          {(locked_pathway?.skillChecklist || []).slice(0, 10).map((skill, idx) => {
            const isAdded = profileData.skills.some(s => s.toLowerCase() === skill.skill.toLowerCase());
            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isAdded) {
                    const newSkills = [...profileData.skills, skill.skill];
                    setProfileData({ ...profileData, skills: newSkills });
                    setTimeout(saveLinkedInData, 500);
                  }
                }}
                disabled={isAdded}
                className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all border ${
                  isAdded
                    ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
                    : "bg-[#0B0F19] border-[#0077B5]/30 text-[#0077B5] hover:bg-[#0077B5]/10"
                }`}
              >
                {isAdded ? "✓ " : "+ "}{skill.skill.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}