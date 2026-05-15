"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useUserStore, ResumeData, ResumeSection, ResumeItem, ResumeBullet } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Sparkles,
  FileCode,
  Loader2,
  Bold,
  Italic,
  Copy,
  Check,
  Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// LaTeX generation utility
function generateLatexString(data: ResumeData): string {
  const escapeLatex = (str: string) => {
    return str
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/~/g, '\\textasciitilde{}');
  };

  const { personalInfo, summary, sections } = data;

  let latex = `\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\geometry{a4paper, margin=0.75in}

\\pagestyle{empty}
\\setlist{noitemsep}

% Custom commands
\\newcommand{\\sectionheader}[1]{\\textbf{\\MakeUppercase{#1}}}

\\begin{document}

% Header
\\centering
{\\Large \\textbf{${escapeLatex(personalInfo.name)}}}\\\\[0.3em]
\\normalsize
${escapeLatex(personalInfo.email)} \\textbar{}
${escapeLatex(personalInfo.phone)}
${personalInfo.links.linkedin ? `\\\\ \\textbar{} ${escapeLatex(personalInfo.links.linkedin)}` : ''}
${personalInfo.links.github ? `\\\\ \\textbar{} ${escapeLatex(personalInfo.links.github)}` : ''}
${personalInfo.links.portfolio ? `\\\\ \\textbar{} ${escapeLatex(personalInfo.links.portfolio)}` : ''}

\\vspace{0.5em}
`;

  // Summary
  if (summary) {
    latex += `% Summary
\\raggedright
\\textbf{Summary:} ${escapeLatex(summary)}

\\vspace{0.5em}
`;
  }

  // Sections
  for (const section of sections) {
    if (section.items.length === 0) continue;

    latex += `% ${section.title}
\\sectionheader{${escapeLatex(section.title)}}
\\raggedright

`;

    for (const item of section.items) {
      // Heading and subheading
      latex += `\\textbf{${escapeLatex(item.heading)}}`;
      if (item.subHeading) {
        latex += ` \\textbar{} ${escapeLatex(item.subHeading)}`;
      }
      if (item.date) {
        latex += ` \\hfill ${escapeLatex(item.date)}`;
      }
      latex += `\\\\\n`;

      // Bullets
      if (item.bullets.length > 0) {
        latex += `\\begin{itemize}[leftmargin=0.25in, itemsep=0pt]\n`;
        for (const bullet of item.bullets) {
          if (bullet.text.trim()) {
            latex += `  \\item ${escapeLatex(bullet.text)}\n`;
          }
        }
        latex += `\\end{itemize}\n`;
      }
      latex += `\n`;
    }
  }

  latex += `\\end{document}`;
  return latex;
}

// LaTeX formatting helper
function insertLatexTag(cursorPos: number, textArea: HTMLTextAreaElement, prefix: string, suffix: string): void {
  const start = textArea.selectionStart;
  const end = textArea.selectionEnd;
  const selectedText = textArea.value.substring(start, end);
  const newText = textArea.value.substring(0, start) + prefix + selectedText + suffix + textArea.value.substring(end);
  textArea.value = newText;
  // Set cursor position after the inserted text
  const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
  textArea.setSelectionRange(newCursorPos, newCursorPos);
  textArea.focus();
}

export default function ResumeEngine() {
  const {
    locked_pathway,
    user_id,
    resumeData,
    updatePersonalInfo,
    updateSummary,
    addSection,
    deleteSection,
    addSectionItem,
    updateSectionItem,
    deleteSectionItem,
    addBullet,
    updateBullet,
    deleteBullet,
    hasUnsavedChanges,
    clearUnsavedChanges,
    setFullResumeData
  } = useUserStore();

  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"resume" | "ats">("resume");
  const [previewTab, setPreviewTab] = useState<"pdf" | "latex">("pdf");
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  // Generate LaTeX
  const latexString = useMemo(() => generateLatexString(resumeData), [resumeData]);

  // PDF URL for iframe
  const pdfUrl = useMemo(() => {
    const encoded = encodeURIComponent(latexString);
    return `https://latexonline.cc/compile?text=${encoded}`;
  }, [latexString]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  // Reset iframe loading when URL changes
  useEffect(() => {
    setIsIframeLoading(true);
  }, [pdfUrl]);

  // Manual save trigger
  const handleSave = useCallback(() => {
    if (user_id) {
      clearUnsavedChanges();
    }
  }, [user_id, clearUnsavedChanges]);

  // Download .tex file
  const handleDownloadTex = () => {
    const element = document.createElement("a");
    const file = new Blob([latexString], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "resume.tex";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download PDF (opens in new tab)
  const handleDownloadPDF = () => {
    window.open(pdfUrl, '_blank');
  };

  // Copy LaTeX to clipboard
  const handleCopyLatex = async () => {
    await navigator.clipboard.writeText(latexString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI ATS Optimization
  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/ai/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error("Optimization failed");
      }

      const optimizedData = await response.json();
      setFullResumeData(optimizedData);

      // Show success toast
      setToast({ show: true, message: "Resume optimized and saved!", type: "success" });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    } catch (error) {
      console.error("Optimization error:", error);
      setToast({ show: true, message: "Failed to optimize. Please try again.", type: "error" });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    } finally {
      setIsOptimizing(false);
    }
  };

  // ATS Score calculation
  const atsScore = useMemo(() => {
    const bullets = resumeData.sections.flatMap(s => s.items.flatMap(i => i.bullets.map(b => b.text)));
    const allText = [...bullets, resumeData.summary].join(' ').toLowerCase();
    const pathwaySkills = (locked_pathway?.skillChecklist || []).map(s => s.skill.toLowerCase());
    const matchedSkills = pathwaySkills.filter(ps => allText.includes(ps));
    const keywordScore = Math.min(100, Math.round((matchedSkills.length / Math.max(pathwaySkills.length, 1)) * 100));
    const hasMetrics = bullets.some(b => /\d+%|\d+[\s]?(users?|clients?|projects?|team|years?|percent|increased|decreased)/i.test(b));
    const quantificationScore = hasMetrics ? 80 : 40;
    const hasActionVerbs = bullets.some(b => /^(built|created|led|managed|developed|implemented|optimized|increased|decreased|designed|architected)/i.test(b));
    const actionVerbScore = hasActionVerbs ? 85 : 50;
    const contactScore = resumeData.personalInfo.name && resumeData.personalInfo.email ? 100 : 50;
    return Math.round((keywordScore * 0.35 + 85 * 0.2 + quantificationScore * 0.2 + actionVerbScore * 0.15 + contactScore * 0.1));
  }, [resumeData, locked_pathway]);

  // Add new section
  const handleAddSection = () => {
    const sectionName = prompt("Enter section name (e.g., Experience, Education, Projects):");
    if (sectionName) {
      addSection(sectionName);
    }
  };

  // Add new item to section
  const handleAddItem = (sectionId: string) => {
    addSectionItem(sectionId, {
      heading: "",
      subHeading: "",
      date: "",
      bullets: []
    });
  };

  // Add new bullet
  const handleAddBullet = (sectionId: string, itemId: string) => {
    addBullet(sectionId, itemId, "");
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-white">Resume Builder</h1>
          <p className="text-gray-400 mt-1">Create ATS-optimized LaTeX resumes with live preview.</p>
        </div>

        <div className="flex bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'resume' ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Builder
          </button>
          <button
            onClick={() => setActiveTab("ats")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'ats' ? 'bg-[#10B981] text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4" /> ATS Score
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "ats" ? (
          <motion.div
            key="ats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* ATS Score Ring */}
            <div className="lg:col-span-1 bg-[#111827]/50 backdrop-blur-xl border border-[#10B981]/20 rounded-3xl p-8 flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold text-white mb-6 self-start w-full flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#10B981]" />
                ATS Compatibility
              </h2>
              <div className="relative w-56 h-56 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke={atsScore >= 80 ? "#10B981" : atsScore >= 60 ? "#D4AF37" : "#EF4444"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (atsScore / 100) * 251.2}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${atsScore >= 80 ? "text-[#10B981]" : atsScore >= 60 ? "text-[#D4AF37]" : "text-red-400"}`}>
                    {atsScore}<span className="text-3xl text-gray-400">/100</span>
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider mt-2">ATS Score</span>
                </div>
              </div>
              <div className="text-center">
                {atsScore >= 80 && <span className="text-[#10B981] font-bold">ATS Optimized</span>}
                {atsScore >= 60 && atsScore < 80 && <span className="text-[#D4AF37] font-bold">Needs Improvements</span>}
                {atsScore < 60 && <span className="text-red-400 font-bold">Not ATS Ready</span>}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Breakdown</h3>
              <div className="bg-[#111827]/50 border border-[#1F2937] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Keyword Match</span>
                  <span className={`text-lg font-bold ${atsScore >= 80 ? "text-[#10B981]" : atsScore >= 60 ? "text-[#D4AF37]" : "text-red-400"}`}>
                    {Math.round(atsScore * 0.35 + 25)}/100
                  </span>
                </div>
                <div className="h-2 bg-[#0B0F19] rounded-full mb-2 overflow-hidden">
                  <div className={`h-full ${atsScore >= 80 ? "bg-[#10B981]" : atsScore >= 60 ? "bg-[#D4AF37]" : "bg-red-500"}`} style={{ width: `${Math.round(atsScore * 0.35 + 25)}%` }} />
                </div>
                <p className="text-sm text-gray-400">Add skills from your career pathway to improve keyword matching.</p>
              </div>
              <div className="bg-[#111827]/50 border border-[#1F2937] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Quantification</span>
                  <span className="text-lg font-bold text-[#10B981]">80/100</span>
                </div>
                <div className="h-2 bg-[#0B0F19] rounded-full mb-2 overflow-hidden">
                  <div className="h-full bg-[#10B981]" style={{ width: '80%' }} />
                </div>
                <p className="text-sm text-gray-400">Use metrics and numbers in your bullet points.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="resume"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-220px)]"
          >
            {/* LEFT PANE: Visual Builder */}
            <div className="bg-[#111827]/50 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-220px)]">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                Visual Editor
              </h2>

              <div className="space-y-6">
                {/* Personal Info Section */}
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-2xl p-4">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={resumeData.personalInfo.name}
                      onChange={(e) => updatePersonalInfo({ name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                    />
                    <input
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                      placeholder="Email"
                      className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                    />
                    <input
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                    />
                    <input
                      value={resumeData.personalInfo.links.linkedin || ""}
                      onChange={(e) => updatePersonalInfo({ links: { ...resumeData.personalInfo.links, linkedin: e.target.value } })}
                      placeholder="LinkedIn URL"
                      className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                    />
                    <input
                      value={resumeData.personalInfo.links.github || ""}
                      onChange={(e) => updatePersonalInfo({ links: { ...resumeData.personalInfo.links, github: e.target.value } })}
                      placeholder="GitHub URL"
                      className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                    />
                    <input
                      value={resumeData.personalInfo.links.portfolio || ""}
                      onChange={(e) => updatePersonalInfo({ links: { ...resumeData.personalInfo.links, portfolio: e.target.value } })}
                      placeholder="Portfolio URL"
                      className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-[#0B0F19] border border-[#1F2937] rounded-2xl p-4">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Professional Summary</h3>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => updateSummary(e.target.value)}
                    placeholder="Brief professional summary..."
                    className="w-full bg-[#111827] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-sm focus:border-[#D4AF37]/50 outline-none resize-none"
                    rows={3}
                  />
                </div>

                {/* Dynamic Sections */}
                {resumeData.sections.map((section) => (
                  <div key={section.id} className="bg-[#0B0F19] border border-[#1F2937] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">{section.title}</h3>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {section.items.map((item) => (
                        <div key={item.id} className="bg-[#111827] border border-[#1F2937] rounded-xl p-3 relative group">
                          {/* Item inputs */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              value={item.heading}
                              onChange={(e) => updateSectionItem(section.id, item.id, { heading: e.target.value })}
                              placeholder="Heading (e.g., Software Engineer)"
                              className="bg-transparent text-white font-semibold text-sm outline-none"
                            />
                            <input
                              value={item.subHeading}
                              onChange={(e) => updateSectionItem(section.id, item.id, { subHeading: e.target.value })}
                              placeholder="Company/Organization"
                              className="bg-transparent text-[#D4AF37] text-xs outline-none"
                            />
                          </div>
                          <input
                            value={item.date}
                            onChange={(e) => updateSectionItem(section.id, item.id, { date: e.target.value })}
                            placeholder="Date (e.g., Jan 2023 - Present)"
                            className="w-full bg-transparent text-gray-400 text-xs outline-none mb-2"
                          />

                          {/* Bullets */}
                          <div className="space-y-2 ml-2 border-l-2 border-[#1F2937] pl-3">
                            {item.bullets.map((bullet) => (
                              <div key={bullet.id} className="flex items-center gap-2">
                                {/* LaTeX Toolbar */}
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      const textarea = document.getElementById(`bullet-${bullet.id}`) as HTMLTextAreaElement;
                                      if (textarea) insertLatexTag(0, textarea, '\\textbf{', '}');
                                    }}
                                    className="p-1 text-gray-500 hover:text-white hover:bg-[#1F2937] rounded transition-colors"
                                    title="Bold"
                                  >
                                    <Bold className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const textarea = document.getElementById(`bullet-${bullet.id}`) as HTMLTextAreaElement;
                                      if (textarea) insertLatexTag(0, textarea, '\\textit{', '}');
                                    }}
                                    className="p-1 text-gray-500 hover:text-white hover:bg-[#1F2937] rounded transition-colors"
                                    title="Italic"
                                  >
                                    <Italic className="w-3 h-3" />
                                  </button>
                                </div>
                                <input
                                  id={`bullet-${bullet.id}`}
                                  value={bullet.text}
                                  onChange={(e) => updateBullet(section.id, item.id, bullet.id, e.target.value)}
                                  placeholder="Enter bullet point..."
                                  className="flex-1 bg-transparent text-gray-300 text-xs outline-none"
                                />
                                <button
                                  onClick={() => deleteBullet(section.id, item.id, bullet.id)}
                                  className="p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => handleAddBullet(section.id, item.id)}
                              className="text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 flex items-center gap-1 py-1"
                            >
                              <Plus className="w-3 h-3" /> Add Bullet
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => deleteSectionItem(section.id, item.id)}
                            className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Item Button */}
                      <button
                        onClick={() => handleAddItem(section.id)}
                        className="w-full py-2 border border-dashed border-[#1F2937] rounded-xl text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" /> Add {section.title.slice(0, -1) || "Item"}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Section Button */}
                <button
                  onClick={handleAddSection}
                  className="w-full py-4 border-2 border-dashed border-[#D4AF37]/30 rounded-2xl text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" /> Add Section
                </button>

                {/* AI Optimize Button */}
                <button
                  onClick={handleOptimizeResume}
                  disabled={isOptimizing}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-[#F4CF57] to-[#D4AF37] rounded-2xl text-black font-bold flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing and Rewriting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Optimize for ATS with AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT PANE: Previewer */}
            <div className="flex flex-col gap-4">
              {/* Preview Tabs */}
              <div className="bg-[#111827]/50 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex bg-[#0B0F19] p-1 rounded-lg">
                    <button
                      onClick={() => setPreviewTab("pdf")}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${previewTab === 'pdf' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      PDF Preview
                    </button>
                    <button
                      onClick={() => setPreviewTab("latex")}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${previewTab === 'latex' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      Raw LaTeX
                    </button>
                  </div>
                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      Unsaved
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-white rounded-2xl overflow-hidden relative">
                  {previewTab === "pdf" ? (
                    <>
                      {isIframeLoading && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            <span className="text-sm text-gray-500">Compiling LaTeX...</span>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={pdfUrl}
                        onLoad={handleIframeLoad}
                        className="w-full h-full min-h-[500px]"
                        title="PDF Preview"
                      />
                    </>
                  ) : (
                    <div className="h-full overflow-auto bg-[#1a1a2e] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400 font-mono">LaTeX Source</span>
                        <button
                          onClick={handleCopyLatex}
                          className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {latexString}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Export Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleDownloadTex}
                    className="flex-1 py-3 bg-[#111827] border border-[#1F2937] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#1F2937] transition-all"
                  >
                    <FileCode className="w-4 h-4" /> Download .tex
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-3 bg-[#D4AF37] text-black rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#D4AF37]/90 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] px-6 py-4 bg-[#1F2937] border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-4 min-w-[320px]"
            style={{ borderColor: toast.type === "success" ? "rgba(212, 175, 55, 0.4)" : "rgba(239, 68, 68, 0.4)" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: toast.type === "success" ? "rgba(212, 175, 55, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
              {toast.type === "success" ? (
                <Check className="w-6 h-6 text-[#D4AF37]" />
              ) : (
                <Sparkles className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {toast.type === "success" ? "Resume Optimized!" : "Optimization Failed"}
              </p>
              <p className="text-xs text-gray-400">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
}