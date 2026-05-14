"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  CircleDashed, 
  Lock, 
  ArrowRight, 
  BookOpen, 
  Code, 
  AlertCircle,
  Sparkles,
  Loader2,
  Award,
  FileBadge,
  ExternalLink,
  X,
  RefreshCw,
  Trophy,
  ChevronRight
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { 
    career_readiness_score, 
    locked_pathway, 
    lms_data,
    toggleProjectCompletion,
    toggleCertCompletion,
    updateReadinessScore,
    hydrateStore
  } = useUserStore();
  
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: "" });
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const [showWarning, setShowWarning] = useState(false);

  const circumference = 251.2;
  const progressOffset = circumference - (career_readiness_score / 100) * circumference;

  useEffect(() => {
    async function init() {
      await hydrateStore();
      setLoading(false);
    }
    init();
  }, [hydrateStore]);

  useEffect(() => {
    if (!locked_pathway) return;
    
    const activeProjects = locked_pathway.projects.filter(p => !p.completed);
    const activeCerts = locked_pathway.requirements.filter(r => !r.completed);

    if (activeProjects.length <= 1 || activeCerts.length <= 1) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [locked_pathway]);

  const handleRegenerate = async (type: 'project' | 'cert', currentItem: string) => {
    setRegenerating(currentItem);
    try {
      const response = await fetch('/api/ai/regenerate-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, currentList: locked_pathway ? (type === 'project' ? locked_pathway.projects.map(p => p.title) : locked_pathway.requirements.map(r => r.name)) : [] })
      });
      
      const newItem = await response.json();
      
      // Update store with new item
      if (locked_pathway) {
        const supabase = createClient();
        let updatedPathway = { ...locked_pathway };
        
        if (type === 'project') {
          updatedPathway.projects = updatedPathway.projects.map(p => 
            p.title === currentItem ? { ...newItem, techStack: newItem.techStack || ['React', 'Node.js'], completed: false } : p
          );
        } else {
          updatedPathway.requirements = updatedPathway.requirements.map(r => 
            r.name === currentItem ? { ...newItem, completed: false } : r
          );
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('career_pathways')
            .update({ pathway_data: updatedPathway })
            .eq('user_id', user.id)
            .eq('status', 'locked');
          
          await hydrateStore();
        }
      }
    } catch (err) {
      console.error("Regeneration failed:", err);
    } finally {
      setRegenerating(null);
    }
  };

  const checkOverlap = (certName: string) => {
    if (!locked_pathway) return;
    const completedCerts = locked_pathway.requirements.filter((r: any) => r.completed && r.name !== certName);
    
    const commonKeywords = ["cloud", "data", "security", "ai", "machine learning", "frontend", "backend", "python", "sql"];
    const hasOverlap = completedCerts.some((c: any) => {
      return commonKeywords.some((kw: string) => 
        certName.toLowerCase().includes(kw) && c.name.toLowerCase().includes(kw)
      );
    });

    if (hasOverlap) {
      setToast({ 
        show: true, 
        message: `Warning: This course overlaps with your completed certifications. Avoid redundancy.` 
      });
      setTimeout(() => setToast({ show: false, message: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!locked_pathway) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-[#111827]/50 rounded-3xl border border-[#D4AF37]/10">
        <Lock className="w-16 h-16 text-[#D4AF37]/30 mb-4" />
        <h2 className="text-2xl font-display font-semibold text-white mb-2">No Pathway Locked</h2>
        <p className="text-gray-400 max-w-md mb-8">Complete your onboarding to generate strategic career pathways tailored to your profile.</p>
        <Link 
          href="/onboarding"
          className="px-8 py-3 rounded-xl bg-[#D4AF37] text-black font-bold hover:scale-105 transition-all inline-block"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  const getGamificationLabel = (score: number) => {
    if (score < 30) return "Career Starter";
    if (score < 60) return "Skill Builder";
    if (score < 90) return "Market Contender";
    return "Market Leader";
  };

  return (
    <div className="flex flex-col gap-8 pb-20 relative">
      {/* Hero Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-accent text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Active Strategic Pathway
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-3xl">
            Locked onto <span className="text-accent">{locked_pathway.title}</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
              {getGamificationLabel(career_readiness_score)}
            </span>
          </div>
        </div>
      </header>

      {/* Warning Popup */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_10px_40px_rgba(239,68,68,0.1)]">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-white mb-1">🚨 STRATEGIC VULNERABILITY DETECTED</h3>
                <p className="text-sm text-red-400/80 leading-relaxed">
                  Selecting fewer than 2 active projects or certifications severely limits your market readiness. 
                  We strongly advise pursuing at least <span className="text-white font-bold">5 active goals</span> to remain competitive in the current hiring landscape.
                </p>
              </div>
              <button 
                onClick={() => setShowWarning(false)}
                className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all whitespace-nowrap"
              >
                ACKNOWLEDGE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Progression UI */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Mission Progression</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {lms_data.stages.map((stage, idx) => (
            <div 
              key={idx}
              className={`relative flex flex-col p-4 rounded-2xl border transition-all ${
                stage.completed 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : stage.locked 
                    ? 'bg-[#0B0F19]/50 border-white/5 opacity-50' 
                    : 'bg-accent/10 border-accent/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${stage.completed ? 'text-green-500' : 'text-accent'}`}>
                  Stage {idx + 1}
                </span>
                {stage.locked ? (
                  <Lock className="w-3 h-3 text-gray-600" />
                ) : stage.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              <h3 className={`text-sm font-bold ${stage.locked ? 'text-gray-500' : 'text-white'}`}>{stage.name}</h3>
              {!stage.locked && !stage.completed && (
                <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "40%" }} // Simplified progress for UI
                    className="h-full bg-accent"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Score Ring */}
        <div className="lg:col-span-1 bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-white mb-8 self-start w-full flex justify-between items-center">
            Readiness Score
            <Trophy className="w-5 h-5 text-accent" />
          </h2>
          <div className="relative w-56 h-56 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="url(#goldGradient)" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={circumference} 
                strokeDashoffset={progressOffset} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#B8972A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-sans text-accent tracking-tighter">{career_readiness_score}<span className="text-3xl">%</span></span>
              <span className="text-xs text-gray-400 uppercase tracking-[0.1em] mt-2">Ready</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-8 text-center bg-[#1A2236] px-4 py-3 rounded-xl border border-[#1F2937]">
            Status: <span className="text-white font-bold">{getGamificationLabel(career_readiness_score)}</span>
          </p>
        </div>

        {/* Skill Checklist */}
        <div className="lg:col-span-2 bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              Foundation Skills
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Stage 1 Requirement</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locked_pathway.skillChecklist.map((item: any, idx: number) => (
              <button 
                key={idx} 
                onClick={async () => {
                  const updatedChecklist = locked_pathway.skillChecklist.map(s => 
                    s.skill === item.skill 
                      ? { ...s, status: (s.status === 'acquired' ? 'missing' : 'acquired') as any } 
                      : s
                  );
                  const supabase = createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from('career_pathways').update({ 
                      pathway_data: { ...locked_pathway, skillChecklist: updatedChecklist } 
                    }).eq('user_id', user.id).eq('status', 'locked');
                    await hydrateStore();
                  }
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all group ${
                  item.status === 'acquired' 
                    ? 'bg-[#10B981]/10 border-[#10B981]/30' 
                    : 'bg-[#1A2236] border-[#1F2937] hover:border-[#D4AF37]/30'
                }`}
              >
                {item.status === 'acquired' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                )}
                <span className={`text-sm ${item.status === 'acquired' ? 'text-[#10B981] line-through' : 'text-white'}`}>
                  {item.skill}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Certifications Catalogue */}
        <div className="lg:col-span-1 bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            Certifications
          </h2>
          <div className="space-y-4">
            {locked_pathway.requirements.map((req: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all relative group ${req.completed ? 'border-green-500/50 bg-green-500/5' : 'border-[#1F2937] bg-[#1A2236] hover:border-[#D4AF37]/30'}`}
              >
                <button 
                  onClick={() => handleRegenerate('cert', req.name)}
                  disabled={regenerating === req.name}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-gray-500 hover:text-accent opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <RefreshCw className={`w-3 h-3 ${regenerating === req.name ? 'animate-spin' : ''}`} />
                </button>

                <div className="flex items-start gap-4 mb-3">
                  <label className="mt-1 relative flex items-center justify-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={req.completed || false}
                      onChange={() => {
                        if (!req.completed) checkOverlap(req.name);
                        toggleCertCompletion(req.name);
                      }}
                      className="peer w-5 h-5 appearance-none border-2 border-slate-600 rounded bg-slate-800 checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-all"
                    />
                    <CheckCircle2 className="absolute w-3 h-3 text-[#0B0F19] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </label>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight pr-6">{req.name}</h3>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{req.provider}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pl-9">
                  <span className="text-[10px] text-accent font-bold">{req.type}</span>
                  <a 
                    href={"https://www.google.com/search?q=" + encodeURIComponent(req.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#0B0F19] text-gray-500 hover:text-accent transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Project Recommendations */}
        <div className="lg:col-span-2 bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Code className="w-5 h-5 text-[#D4AF37]" />
            Practical Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locked_pathway.projects.map((proj: any, idx: number) => (
              <div 
                key={idx} 
                className={`group bg-[#1A2236] border transition-all relative rounded-2xl p-6 ${proj.completed ? 'border-green-500/50 bg-green-500/5' : 'border-[#1F2937] hover:border-[#D4AF37]/40'}`}
              >
                <button 
                  onClick={() => handleRegenerate('project', proj.title)}
                  disabled={regenerating === proj.title}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-gray-500 hover:text-accent opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <RefreshCw className={`w-4 h-4 ${regenerating === proj.title ? 'animate-spin' : ''}`} />
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <label className="relative flex items-center justify-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={proj.completed || false}
                        onChange={() => toggleProjectCompletion(proj.title)}
                        className="peer w-6 h-6 appearance-none border-2 border-slate-600 rounded-lg bg-slate-800 checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-all"
                      />
                      <CheckCircle2 className="absolute w-4 h-4 text-[#0B0F19] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </label>
                    <div className="p-2.5 rounded-xl bg-[#0B0F19] text-accent border border-[#1F2937]">
                      <Code className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <h3 className="text-md font-bold text-white mb-2 group-hover:text-accent transition-colors">{proj.title}</h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{proj.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {proj.techStack.map((tech: string) => (
                    <span key={tech} className="text-[10px] bg-[#0B0F19] px-2 py-1 rounded border border-[#1F2937] text-gray-500 font-mono">{tech}</span>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveProject(proj)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0B0F19] border border-[#1F2937] text-xs font-bold text-accent hover:bg-accent hover:text-black transition-all"
                >
                  View Build Guide <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Project Build Guide Modal */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111827] border border-[#D4AF37]/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[80vh] overflow-y-auto mx-auto"
            >
              <div className="p-8 md:p-10">
                <button 
                  onClick={() => setActiveProject(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <Code className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">{activeProject.title}</h2>
                    <p className="text-sm text-[#D4AF37]">Strategic Build Guide</p>
                  </div>
                </div>

                <p className="text-gray-400 mb-8 leading-relaxed">
                  {activeProject.description}
                </p>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Execution Steps</h3>
                  <div className="space-y-4">
                    {[
                      { step: "Phase 1: Architecture", desc: "Define data models and core system flow. Setup the repository with " + activeProject.techStack.join(", ") + "." },
                      { step: "Phase 2: Core Logic", desc: "Implement the primary engine/features. Focus on modularity and high performance." },
                      { step: "Phase 3: Integration", desc: "Connect frontend components with backend services. Ensure seamless data flow." },
                      { step: "Phase 4: Deployment", desc: "Optimize for production. Deploy to Vercel/AWS and setup CI/CD pipelines." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#1A2236] border border-[#1F2937]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B0F19] flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-1">{item.step}</p>
                          <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <div className="flex gap-2">
                    {activeProject.techStack.slice(0, 3).map((tech: string) => (
                      <span key={tech} className="text-[10px] bg-[#0B0F19] px-3 py-1 rounded-full border border-[#1F2937] text-gray-500">{tech}</span>
                    ))}
                  </div>
                  <button 
                    onClick={() => window.open(`https://github.com/search?q=${encodeURIComponent(activeProject.title)}`, '_blank')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0F19] font-bold text-sm hover:scale-105 transition-all"
                  >
                    Find on GitHub <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] px-6 py-4 bg-[#1F2937] border border-[#D4AF37]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Strategy Note</p>
              <p className="text-xs text-gray-400">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
