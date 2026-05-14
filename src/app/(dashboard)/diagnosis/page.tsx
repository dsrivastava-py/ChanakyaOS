"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Globe,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  PieChart,
  BarChart3,
  Users,
  Briefcase,
  BookOpen,
  Code,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface DiagnosisScore {
  category: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "needs-work" | "critical";
  breakdown: { item: string; points: number; suggestion: string }[];
}

interface SkillGap {
  skill: string;
  status: "have" | "missing" | "priority";
  category: string;
  urgency: "high" | "medium" | "low";
}

export default function DiagnosisPage() {
  const {
    locked_pathway,
    career_readiness_score,
    linkedin_health_score,
    profile
  } = useUserStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisScore[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [competitivenessPercentile, setCompetitivenessPercentile] = useState(65);

  useEffect(() => {
    generateDiagnosis();
  }, [locked_pathway]);

  const generateDiagnosis = async () => {
    setIsLoading(true);

    // Simulate AI diagnosis based on pathway data
    if (locked_pathway) {
      const resumeScore = calculateResumeScore();
      const linkedInScore = linkedin_health_score || 55;
      const skillScore = calculateSkillScore();
      const pathwayScore = locked_pathway.readinessScore || 0;

      const newDiagnosis: DiagnosisScore[] = [
        {
          category: "Resume Score",
          score: resumeScore,
          maxScore: 100,
          status: resumeScore >= 80 ? "excellent" : resumeScore >= 60 ? "good" : resumeScore >= 40 ? "needs-work" : "critical",
          breakdown: [
            { item: "ATS Keywords", points: resumeScore * 0.3, suggestion: "Add more role-specific keywords from job descriptions" },
            { item: "Quantification", points: resumeScore * 0.25, suggestion: "Add metrics and numbers to achievements" },
            { item: "Action Verbs", points: resumeScore * 0.2, suggestion: "Start bullet points with strong action verbs" },
            { item: "Format Compliance", points: resumeScore * 0.25, suggestion: "Ensure proper ATS-friendly formatting" },
          ]
        },
        {
          category: "LinkedIn Score",
          score: linkedInScore,
          maxScore: 100,
          status: linkedInScore >= 80 ? "excellent" : linkedInScore >= 60 ? "good" : linkedInScore >= 40 ? "needs-work" : "critical",
          breakdown: [
            { item: "Headline Optimization", points: linkedInScore * 0.25, suggestion: "Include target role and key skills in headline" },
            { item: "Summary Completeness", points: linkedInScore * 0.25, suggestion: "Write compelling 200-word summary" },
            { item: "Skills Section", points: linkedInScore * 0.25, suggestion: "Add 20+ relevant skills" },
            { item: "Experience Keywords", points: linkedInScore * 0.25, suggestion: "Optimize experience descriptions for search" },
          ]
        },
        {
          category: "Skill Readiness",
          score: skillScore,
          maxScore: 100,
          status: skillScore >= 80 ? "excellent" : skillScore >= 60 ? "good" : skillScore >= 40 ? "needs-work" : "critical",
          breakdown: locked_pathway.skillChecklist.map(s => ({
            item: s.skill,
            points: s.status === 'acquired' ? 100 : 0,
            suggestion: s.status === 'acquired' ? "Skill acquired" : `Learn ${s.skill} from recommended resources`
          }))
        },
        {
          category: "Career Pathway",
          score: pathwayScore,
          maxScore: 100,
          status: pathwayScore >= 80 ? "excellent" : pathwayScore >= 60 ? "good" : pathwayScore >= 40 ? "needs-work" : "critical",
          breakdown: [
            { item: "Pathway Clarity", points: pathwayScore * 0.4, suggestion: "Your career direction is clear" },
            { item: "Requirements Progress", points: pathwayScore * 0.3, suggestion: "Complete certifications and projects" },
            { item: "Market Alignment", points: pathwayScore * 0.3, suggestion: "Continue building relevant skills" },
          ]
        }
      ];

      // Generate skill gaps
      const gaps: SkillGap[] = locked_pathway.skillChecklist
        .filter(s => s.status === 'missing')
        .map((s, idx) => ({
          skill: s.skill,
          status: "missing",
          category: idx < 3 ? "Core" : idx < 6 ? "Secondary" : "Optional",
          urgency: idx < 3 ? "high" : idx < 6 ? "medium" : "low" as "high" | "medium" | "low"
        }));

      setDiagnosis(newDiagnosis);
      setSkillGaps(gaps);
      setCompetitivenessPercentile(Math.min(95, Math.max(20, pathwayScore - 10 + Math.floor(Math.random() * 20))));
    }

    setIsLoading(false);
  };

  const calculateResumeScore = () => {
    // Simple calculation based on pathway requirements
    if (!locked_pathway) return 45;
    const acquiredSkills = locked_pathway.skillChecklist.filter(s => s.status === 'acquired').length;
    const totalSkills = locked_pathway.skillChecklist.length || 1;
    const baseScore = 40;
    const bonus = (acquiredSkills / totalSkills) * 40;
    return Math.min(95, Math.round(baseScore + bonus));
  };

  const calculateSkillScore = () => {
    if (!locked_pathway) return 30;
    const acquired = locked_pathway.skillChecklist.filter(s => s.status === 'acquired').length;
    const total = locked_pathway.skillChecklist.length || 1;
    return Math.round((acquired / total) * 100);
  };

  const regenerateDiagnosis = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    generateDiagnosis();
    setIsGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-400";
      case "good": return "text-blue-400";
      case "needs-work": return "text-yellow-400";
      case "critical": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-500/20 border-green-500/30";
      case "good": return "bg-blue-500/20 border-blue-500/30";
      case "needs-work": return "bg-yellow-500/20 border-yellow-500/30";
      case "critical": return "bg-red-500/20 border-red-500/30";
      default: return "bg-gray-500/20 border-gray-500/30";
    }
  };

  const exportToPDF = () => {
    // Generate printable view
    const printContent = `
      <html>
        <head>
          <title>ChanakyaOS - Career Diagnosis Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #D4AF37; }
            .score-card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; }
            .breakdown-item { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Career Diagnosis Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <h2>Overall Readiness: ${career_readiness_score}%</h2>
          ${diagnosis.map(d => `
            <div class="score-card">
              <h3>${d.category}: ${d.score}/100</h3>
              <p>Status: ${d.status}</p>
              ${d.breakdown.map(b => `<div class="breakdown-item">- ${b.suggestion}</div>`).join('')}
            </div>
          `).join('')}
          <h2>Priority Skills to Learn</h2>
          ${skillGaps.filter(s => s.urgency === 'high').map(s => `<p>- ${s.skill}</p>`).join('')}
        </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ChanakyaOS_Diagnosis_Report.html';
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-accent text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Profile Diagnosis
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
            Your Complete <span className="text-accent">Career Health Check</span>
          </h1>
          <p className="text-gray-400 mt-2 max-w-xl">
            Comprehensive analysis of your profile against {locked_pathway?.title || "your target role"} requirements
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={regenerateDiagnosis}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh Analysis
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-black font-bold hover:scale-105 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </header>

      {/* Overall Score Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Overall Career Readiness</h2>
            <p className="text-gray-400 mb-4">
              Based on your resume, LinkedIn, skills, and pathway progress
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/resume" className="text-sm text-[#D4AF37] hover:underline">→ Improve Resume Score</Link>
              <Link href="/linkedin" className="text-sm text-[#D4AF37] hover:underline">→ Boost LinkedIn</Link>
              <Link href="/skills-gap" className="text-sm text-[#D4AF37] hover:underline">→ View Skill Gaps</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-accent">{career_readiness_score}<span className="text-2xl text-gray-400">%</span></div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Readiness Score</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{competitivenessPercentile}<span className="text-2xl text-gray-400">%</span></div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">vs. Peers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {diagnosis.map((score, idx) => (
          <motion.div
            key={score.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-[#111827]/75 backdrop-blur-md border rounded-3xl p-8 ${getStatusBg(score.status)}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {score.category === "Resume Score" && <FileText className="w-6 h-6 text-[#D4AF37]" />}
                {score.category === "LinkedIn Score" && <Globe className="w-6 h-6 text-[#0077B5]" />}
                {score.category === "Skill Readiness" && <Target className="w-6 h-6 text-[#10B981]" />}
                {score.category === "Career Pathway" && <TrendingUp className="w-6 h-6 text-accent" />}
                <h3 className="text-xl font-semibold text-white">{score.category}</h3>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getStatusColor(score.status)}`}>
                  {score.score}<span className="text-lg text-gray-500">/100</span>
                </div>
                <div className={`text-xs uppercase tracking-wider font-bold ${getStatusColor(score.status)}`}>
                  {score.status.replace('-', ' ')}
                </div>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  score.status === 'excellent' ? 'bg-green-500' :
                  score.status === 'good' ? 'bg-blue-500' :
                  score.status === 'needs-work' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(score.score / score.maxScore) * 100}%` }}
              />
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Action Items</h4>
              {score.breakdown.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#0B0F19]/50 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white">{item.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skill Gaps Summary */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <PieChart className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-semibold text-white">Priority Skill Gaps</h3>
          </div>
          <Link
            href="/skills-gap"
            className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            View Full Analysis <TrendingUp className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillGaps.slice(0, 6).map((gap, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${
                gap.urgency === 'high'
                  ? 'bg-red-500/10 border-red-500/30'
                  : gap.urgency === 'medium'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-[#1A2236] border-[#1F2937]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{gap.skill}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  gap.urgency === 'high' ? 'bg-red-500 text-white' :
                  gap.urgency === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {gap.urgency}
                </span>
              </div>
              <div className="text-xs text-gray-400">{gap.category} Skill</div>
            </div>
          ))}
        </div>

        {skillGaps.length > 6 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            + {skillGaps.length - 6} more skills to develop
          </p>
        )}
      </div>

      {/* Competitiveness Analysis */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-semibold text-white">Competitive Positioning</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-center h-48 bg-[#0B0F19] rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 flex items-end">
                {[35, 45, 55, 65, 75, 85, 95].map((val, i) => (
                  <div
                    key={i}
                    className={`flex-1 ${val <= competitivenessPercentile ? 'bg-[#D4AF37]' : 'bg-[#1F2937]'}`}
                    style={{ height: `${(i + 1) * 10}%`, margin: '0 2px', borderRadius: '4px 4px 0 0' }}
                  />
                ))}
              </div>
              <div className="absolute bottom-4 text-center">
                <span className="text-3xl font-bold text-accent">{competitivenessPercentile}%</span>
                <div className="text-xs text-gray-500">Percentile</div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">
              You rank above {competitivenessPercentile}% of candidates targeting {locked_pathway?.title || "similar roles"}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Key Differentiators</h4>
            {locked_pathway?.requirements?.filter(r => r.completed).slice(0, 3).map((cert, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                <span className="text-white">{cert.name}</span>
              </div>
            ))}
            {(!locked_pathway?.requirements?.filter(r => r.completed).length) && (
              <p className="text-gray-500 text-sm">Complete certifications to improve your ranking</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/10 rounded-3xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          Recommended Next Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/resume" className="p-4 bg-[#111827] border border-[#1F2937] rounded-2xl hover:border-[#D4AF37]/30 transition-all group">
            <FileText className="w-8 h-8 text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-semibold mb-1">Optimize Resume</h4>
            <p className="text-xs text-gray-400">Add ATS keywords and quantify achievements</p>
          </Link>
          <Link href="/linkedin" className="p-4 bg-[#111827] border border-[#1F2937] rounded-2xl hover:border-[#0077B5]/30 transition-all group">
            <Globe className="w-8 h-8 text-[#0077B5] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-semibold mb-1">Enhance LinkedIn</h4>
            <p className="text-xs text-gray-400">Rewrite headline and add more skills</p>
          </Link>
          <Link href="/skills-gap" className="p-4 bg-[#111827] border border-[#1F2937] rounded-2xl hover:border-[#10B981]/30 transition-all group">
            <Target className="w-8 h-8 text-[#10B981] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-semibold mb-1">Learn Priority Skills</h4>
            <p className="text-xs text-gray-400">Focus on high-urgency missing skills</p>
          </Link>
        </div>
      </div>
    </div>
  );
}