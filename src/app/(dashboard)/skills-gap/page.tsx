"use client";

import { useState, useEffect } from "react";
import {
  Target,
  CheckCircle2,
  CircleDashed,
  ArrowRight,
  BookOpen,
  Code,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Clock,
  BarChart3,
  Zap
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SkillItem {
  skill: string;
  status: "acquired" | "missing";
  category: string;
  priority: number;
  estimatedTime: string;
  resources: string[];
}

export default function SkillsGapPage() {
  const { locked_pathway, active_pathway } = useUserStore();
  const [activeFilter, setActiveFilter] = useState<"all" | "acquired" | "missing">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Transform pathway data into skill items
  const allSkills: SkillItem[] = (locked_pathway?.skillChecklist || []).map((s, idx) => ({
    skill: s.skill,
    status: s.status,
    category: idx < 3 ? "Core" : idx < 6 ? "Secondary" : "Optional",
    priority: idx + 1,
    estimatedTime: idx < 3 ? "2-4 weeks" : "1-2 weeks",
    resources: [
      `https://www.google.com/search?q=learn+${s.skill.replace(/\s+/g, '+')}`,
      `https://www.coursera.org/search?query=${s.skill.replace(/\s+/g, '+')}`
    ]
  }));

  const filteredSkills = allSkills.filter(s => {
    const matchesFilter = activeFilter === "all" || s.status === activeFilter;
    const matchesSearch = s.skill.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const acquiredCount = allSkills.filter(s => s.status === "acquired").length;
  const missingCount = allSkills.filter(s => s.status === "missing").length;
  const completionPercentage = allSkills.length ? Math.round((acquiredCount / allSkills.length) * 100) : 0;

  // Calculate urgency levels
  const highUrgency = allSkills.filter(s => s.status === "missing").slice(0, 3);
  const mediumUrgency = allSkills.filter(s => s.status === "missing").slice(3, 6);
  const lowUrgency = allSkills.filter(s => s.status === "missing").slice(6);

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <header className="mb-4">
        <p className="text-accent text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Skill Gap Analyzer
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
          Close Your <span className="text-accent">Skill Gaps</span>
        </h1>
        <p className="text-gray-400 mt-2 max-w-xl">
          Visual breakdown of your current skills vs. {locked_pathway?.title || "target role"} requirements
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-1">{allSkills.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total Skills</div>
        </div>
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-[#10B981] mb-1">{acquiredCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Acquired</div>
        </div>
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-[#D4AF37] mb-1">{missingCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">To Learn</div>
        </div>
        <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-2xl p-6 text-center">
          <div className="text-3xl font-bold text-[#3B82F6] mb-1">{completionPercentage}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Skill Acquisition Progress
          </h3>
          <span className="text-accent font-bold">{completionPercentage}%</span>
        </div>
        <div className="h-4 bg-[#0B0F19] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-[#10B981] to-[#D4AF37]"
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          {(["all", "acquired", "missing"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === filter
                  ? "bg-[#D4AF37] text-black"
                  : "bg-[#111827] border border-[#1F2937] text-gray-400 hover:text-white"
              }`}
            >
              {filter === "all" ? "All Skills" : filter === "acquired" ? "Acquired" : "To Learn"}
              <span className="ml-2 text-xs opacity-70">
                ({filter === "all" ? allSkills.length : filter === "acquired" ? acquiredCount : missingCount})
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#111827] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

      {/* Visual Gap Analysis - Have/Missing Table */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Skill Comparison Matrix
        </h3>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Skill</div>
          <div className="col-span-2 text-center">Category</div>
          <div className="col-span-2 text-center">Priority</div>
          <div className="col-span-2 text-center">Time</div>
          <div className="col-span-2 text-center">Status</div>
        </div>

        {/* Skill Rows */}
        <div className="space-y-2">
          {filteredSkills.map((skill, idx) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedSkill(skill)}
              className={`grid grid-cols-12 gap-2 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] ${
                skill.status === "acquired"
                  ? "bg-[#10B981]/10 border border-[#10B981]/30"
                  : "bg-[#1A2236] border border-[#1F2937] hover:border-[#D4AF37]/30"
              }`}
            >
              <div className="col-span-4 flex items-center gap-3">
                {skill.status === "acquired" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <CircleDashed className="w-5 h-5 text-gray-600" />
                )}
                <span className={`font-medium ${skill.status === "acquired" ? "text-[#10B981]" : "text-white"}`}>
                  {skill.skill}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-xs px-2 py-1 rounded ${
                  skill.category === "Core" ? "bg-red-500/20 text-red-400" :
                  skill.category === "Secondary" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-gray-600/20 text-gray-400"
                }`}>
                  {skill.category}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-gray-400 text-sm">#{skill.priority}</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-gray-400 text-sm flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {skill.estimatedTime}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-xs font-bold uppercase ${
                  skill.status === "acquired" ? "text-[#10B981]" : "text-[#D4AF37]"
                }`}>
                  {skill.status === "acquired" ? "✓ Acquired" : "○ To Learn"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Priority Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Priority */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-white font-semibold">High Priority</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Learn these immediately to improve your profile</p>
          <div className="space-y-3">
            {highUrgency.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0F19] rounded-xl">
                <span className="text-white text-sm">{skill.skill}</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Medium Priority */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-yellow-500" />
            <h3 className="text-white font-semibold">Medium Priority</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Add these after completing high priority skills</p>
          <div className="space-y-3">
            {mediumUrgency.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0F19] rounded-xl">
                <span className="text-white text-sm">{skill.skill}</span>
                <ArrowRight className="w-4 h-4 text-yellow-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Low Priority */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="text-white font-semibold">Nice to Have</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Enhance your profile with these skills</p>
          <div className="space-y-3">
            {lowUrgency.map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0F19] rounded-xl">
                <span className="text-white text-sm">{skill.skill}</span>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Resources */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          Recommended Learning Path
        </h3>
        <div className="space-y-4">
          {highUrgency.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{skill.skill}</h4>
                <p className="text-xs text-gray-400">Estimated time: {skill.estimatedTime}</p>
              </div>
              <a
                href={skill.resources[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/20 transition-all"
              >
                Find Resources <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSkill(null)}
              className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111827] border border-[#D4AF37]/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8"
            >
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>

              <div className="flex items-center gap-4 mb-6">
                {selectedSkill.status === "acquired" ? (
                  <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
                ) : (
                  <CircleDashed className="w-10 h-10 text-[#D4AF37]" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSkill.skill}</h2>
                  <p className="text-sm text-gray-400">{selectedSkill.category} Skill</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0B0F19] p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Priority</div>
                  <div className="text-white font-bold">#{selectedSkill.priority}</div>
                </div>
                <div className="bg-[#0B0F19] p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Time</div>
                  <div className="text-white font-bold">{selectedSkill.estimatedTime}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Learning Resources</h4>
                {selectedSkill.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-[#0B0F19] border border-[#1F2937] rounded-xl hover:border-[#D4AF37]/30 transition-all"
                  >
                    <span className="text-white text-sm">Resource {idx + 1}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>

              {selectedSkill.status === "acquired" && (
                <div className="mt-6 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-center">
                  <CheckCircle2 className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
                  <span className="text-[#10B981] font-medium">Skill Acquired!</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}