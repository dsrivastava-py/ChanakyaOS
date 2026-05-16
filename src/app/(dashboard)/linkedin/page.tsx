"use client";

import { useState, useCallback } from "react";
import { useUserStore, LinkedInElement } from "@/store/useUserStore";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  User,
  Briefcase,
  Lightbulb,
  Image,
  Copy,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

interface ToastMessage {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export default function LinkedinOptimizer() {
  const {
    linkedInData,
    setLinkedInData,
    updateLinkedInElement,
    locked_pathway,
    resumeData,
    profile
  } = useUserStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [toast, setToast] = useState<ToastMessage>({ show: false, message: "", type: "error" });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [postIdeas, setPostIdeas] = useState<Array<{
    idea: string;
    hook: string;
    targetAudience: string;
    resourceLinks: string[];
  }>>([]);

  // Check if we have parsed data (for showing dashboard instead of upload)
  const hasLinkedInData = linkedInData && linkedInData.parsedPdfText && linkedInData.profileHealthScore > 0;

  // Show toast message
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Check file size first - Vercel payload guard
    if (file.size > MAX_FILE_SIZE) {
      showToast("File too large. Vercel limits uploads to 4MB. Please compress your PDF or remove images from your LinkedIn export.", "error");
      return;
    }

    if (!file.type.includes("pdf")) {
      showToast("Please upload a PDF file.", "error");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Parse PDF
      const formData = new FormData();
      formData.append("file", file);

      const parseResponse = await fetch("/api/parse-linkedin-pdf", {
        method: "POST",
        body: formData
      });

      if (!parseResponse.ok) {
        const error = await parseResponse.json();
        throw new Error(error.error || "Failed to parse PDF");
      }

      const parseResult = await parseResponse.json();

      // Step 2: Analyze with AI
      const analyzeResponse = await fetch("/api/ai/analyze-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsedText: parseResult.text })
      });

      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json();
        throw new Error(error.error || "Failed to analyze LinkedIn profile");
      }

      const analyzeResult = await analyzeResponse.json();

      // Step 3: Save to Zustand store
      setLinkedInData({
        parsedPdfText: parseResult.text,
        profileHealthScore: analyzeResult.profileHealthScore,
        elements: analyzeResult.elements
      });

      showToast("Profile analyzed successfully!", "success");

    } catch (error) {
      console.error("Upload error:", error);
      showToast(error instanceof Error ? error.message : "Failed to process profile", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30";
    if (score >= 5) return "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };

  // Copy to clipboard
  const handleCopy = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Apply optimized version
  const handleApplyOptimization = (elementKey: keyof typeof linkedInData.elements, optimizedVersion: string) => {
    updateLinkedInElement(elementKey, {
      originalText: optimizedVersion,
      optimizedVersion: null
    });
    showToast("Applied optimized version!", "success");
  };

  // Handle AI optimization for element
  const handleOptimizeElement = async (elementKey: keyof typeof linkedInData.elements, originalText: string) => {
    setIsOptimizing(elementKey);

    try {
      const globalContext = {
        resumeData,
        lockedPathway: locked_pathway,
        profile
      };

      const response = await fetch("/api/ai/optimize-linkedin-element", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elementName: elementKey,
          originalText,
          globalContext: JSON.stringify(globalContext)
        })
      });

      if (!response.ok) {
        throw new Error("Failed to optimize element");
      }

      const result = await response.json();

      updateLinkedInElement(elementKey, {
        optimizedVersion: result.optimizedVersion,
        aiScore: result.score,
        aiFeedback: result.explanation
      });

      showToast(`${elementKey} optimized successfully!`, "success");
    } catch (error) {
      console.error("Optimization error:", error);
      showToast("Failed to optimize. Please try again.", "error");
    } finally {
      setIsOptimizing(null);
    }
  };

  // Handle generate post ideas
  const handleGeneratePostIdeas = async () => {
    setIsGeneratingPosts(true);

    try {
      const globalContext = {
        resumeData,
        lockedPathway: locked_pathway,
        profile
      };

      const response = await fetch("/api/ai/generate-post-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalContext: JSON.stringify(globalContext) })
      });

      if (!response.ok) {
        throw new Error("Failed to generate post ideas");
      }

      const result = await response.json();
      setPostIdeas(result.postIdeas);
      showToast("Post ideas generated!", "success");
    } catch (error) {
      console.error("Generate posts error:", error);
      showToast("Failed to generate ideas. Please try again.", "error");
    } finally {
      setIsGeneratingPosts(false);
    }
  };

  // Render element card
  const renderElementCard = (
    key: keyof typeof linkedInData.elements,
    element: LinkedInElement,
    title: string,
    icon: React.ReactNode
  ) => (
    <div className="bg-[#111827]/50 border border-[#1F2937] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0077B5]/10 flex items-center justify-center text-[#0077B5]">
            {icon}
          </div>
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getScoreColor(element.aiScore)}`}>
          {element.aiScore}/10
        </span>
      </div>

      {/* Original Text */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Original</p>
        <p className="text-gray-300 text-sm leading-relaxed bg-[#0B0F19] p-4 rounded-xl border border-[#1F2937]">
          {element.originalText || "No content detected"}
        </p>
      </div>

      {/* AI Feedback */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">AI Feedback</p>
        <p className="text-gray-400 text-sm italic">{element.aiFeedback}</p>
      </div>

      {/* Optimized Version */}
      {element.optimizedVersion && (
        <div className="mb-4 bg-gradient-to-r from-[#10B981]/5 to-[#0077B5]/5 border border-[#10B981]/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#10B981] uppercase tracking-widest font-bold">Suggested Improvement</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(element.optimizedVersion!, `copy-${key}`)}
                className="px-3 py-1 text-xs text-gray-400 hover:text-white bg-[#1F2937] rounded-lg flex items-center gap-1"
              >
                {copiedField === `copy-${key}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
              <button
                onClick={() => handleApplyOptimization(key, element.optimizedVersion!)}
                className="px-3 py-1 text-xs bg-[#10B981] text-white rounded-lg hover:bg-[#10B981]/90"
              >
                Apply
              </button>
            </div>
          </div>
          <p className="text-white text-sm leading-relaxed">{element.optimizedVersion}</p>
        </div>
      )}

      {/* Optimize Button */}
      <button
        onClick={() => handleOptimizeElement(key, element.originalText)}
        disabled={isOptimizing === key}
        className="w-full py-3 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,119,181,0.3)] transition-all disabled:opacity-50"
      >
        {isOptimizing === key ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Optimizing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Optimize with AI
          </>
        )}
      </button>
    </div>
  );

  // UPLOAD STATE
  if (!hasLinkedInData) {
    return (
      <div className="flex flex-col gap-8 pb-20">
        <header>
          <p className="text-[#0077B5] text-xs font-bold tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" />
            LinkedIn Strategic Optimizer
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight">
            Upload Your <span className="text-[#0077B5]">LinkedIn Profile</span>
          </h1>
          <p className="text-gray-400 mt-2">Upload your LinkedIn PDF export to get AI-powered optimization</p>
        </header>

        <div className="max-w-2xl mx-auto w-full">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
              ${isDragging ? "border-[#0077B5] bg-[#0077B5]/5" : "border-[#1F2937] hover:border-[#0077B5]/50"}
              ${isUploading ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-[#0077B5] animate-spin" />
                <div>
                  <p className="text-white font-semibold text-lg">Parsing Profile & Generating Analysis...</p>
                  <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#0077B5]/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#0077B5]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Drop your LinkedIn PDF here</p>
                  <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
                </div>
                <p className="text-gray-500 text-xs">PDF up to 4MB • LinkedIn Export Format</p>
              </div>
            )}
          </div>

          <div className="mt-8 bg-[#111827]/30 border border-[#1F2937] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
              Important Note
            </h3>
            <p className="text-gray-400 text-sm">
              Due to Vercel&apos;s serverless function limits, PDF uploads are capped at 4MB. If your LinkedIn export is larger, please:
            </p>
            <ul className="text-gray-400 text-sm mt-3 space-y-2 list-disc list-inside">
              <li>Remove images from your LinkedIn PDF export</li>
              <li>Use "Save as PDF" with minimal formatting</li>
              <li>Compress existing PDF before uploading</li>
            </ul>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="fixed bottom-10 left-1/2 z-[100] px-6 py-4 bg-[#1F2937] border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-4 min-w-[320px]"
              style={{ borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: toast.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
                {toast.type === "success" ? (
                  <Check className="w-6 h-6 text-[#10B981]" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {toast.type === "success" ? "Success!" : "Error"}
                </p>
                <p className="text-xs text-gray-400">{toast.message}</p>
              </div>
              <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // REPLICA DASHBOARD (HYDRATED STATE)
  const circumference = 2 * Math.PI * 45;
  const progressOffset = circumference - (linkedInData.profileHealthScore / 100) * circumference;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header>
        <p className="text-[#0077B5] text-xs font-bold tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5" />
          LinkedIn Strategic Optimizer
        </p>
        <h1 className="text-3xl md:text-5xl font-display font-semibold text-white tracking-tight">
          Profile <span className="text-[#0077B5]">Health Dashboard</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT SIDEBAR: Health Score Ring */}
        <div className="lg:col-span-1">
          <div className="bg-[#111827]/50 backdrop-blur-xl border border-[#0077B5]/20 rounded-3xl p-6 sticky top-6">
            <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0077B5]" />
              Profile Score
            </h2>

            {/* Animated Circular Progress */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#0077B5"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: progressOffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_10px_rgba(0,119,181,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-5xl font-bold text-white"
                >
                  {linkedInData.profileHealthScore}
                </motion.span>
                <span className="text-gray-400 text-sm">/100</span>
              </div>
            </div>

            <div className="text-center">
              {linkedInData.profileHealthScore >= 80 && (
                <span className="text-[#10B981] font-bold">Excellent Profile!</span>
              )}
              {linkedInData.profileHealthScore >= 60 && linkedInData.profileHealthScore < 80 && (
                <span className="text-[#D4AF37] font-bold">Good - Needs Work</span>
              )}
              {linkedInData.profileHealthScore < 60 && (
                <span className="text-red-400 font-bold">Needs Major Optimization</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT: Profile Replica */}
        <div className="lg:col-span-3 space-y-6">
          {/* LinkedIn-style Header */}
          <div className="bg-[#111827]/50 border border-[#1F2937] rounded-3xl overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] relative">
              <div className="absolute top-4 right-4 px-2 py-1 bg-black/30 rounded-lg text-xs text-white">
                Banner: {linkedInData.elements.banner.aiScore}/10
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-[#111827] bg-[#1F2937] flex items-center justify-center overflow-hidden">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
                <div className="absolute top-0 right-0 px-2 py-1 bg-black/30 rounded-lg text-xs text-white">
                  Photo: {linkedInData.elements.pfp.aiScore}/10
                </div>
              </div>

              {/* Headline */}
              {renderElementCard("headline", linkedInData.elements.headline, "Headline", <FileText className="w-5 h-5" />)}
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 gap-6">
            {renderElementCard("about", linkedInData.elements.about, "About", <User className="w-5 h-5" />)}
            {renderElementCard("experience", linkedInData.elements.experience, "Experience", <Briefcase className="w-5 h-5" />)}
            {renderElementCard("skills", linkedInData.elements.skills, "Skills", <Lightbulb className="w-5 h-5" />)}
          </div>

          {/* CONTENT ENGINE: Post Idea Generator */}
          <div className="bg-[#111827]/50 border border-[#0077B5]/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0077B5]/10 flex items-center justify-center text-[#0077B5]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="text-white font-semibold text-lg">Content Engine</h2>
              </div>
              <button
                onClick={handleGeneratePostIdeas}
                disabled={isGeneratingPosts}
                className="py-2 px-4 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,119,181,0.3)] transition-all disabled:opacity-50 text-sm"
              >
                {isGeneratingPosts ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Strategic Post Ideas
                  </>
                )}
              </button>
            </div>

            {postIdeas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {postIdeas.map((post, idx) => (
                  <div key={idx} className="bg-[#0B0F19] border border-[#1F2937] rounded-2xl p-5 hover:border-[#0077B5]/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#0077B5] text-xs font-bold uppercase tracking-wider">Idea {idx + 1}</span>
                      <span className="text-gray-500 text-xs">{post.targetAudience}</span>
                    </div>

                    <h3 className="text-white font-semibold mb-2">{post.hook}</h3>
                    <p className="text-gray-400 text-sm mb-4">{post.idea}</p>

                    <div className="flex flex-col gap-2 mt-auto">
                      <a
                        href={post.resourceLinks[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-[#0077B5] hover:text-[#00A0DC] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Research {post.targetAudience}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  Click &quot;Generate Strategic Post Ideas&quot; to get AI-powered content suggestions for your LinkedIn
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] px-6 py-4 bg-[#1F2937] border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-4 min-w-[320px]"
            style={{ borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: toast.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
              {toast.type === "success" ? (
                <Check className="w-6 h-6 text-[#10B981]" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {toast.type === "success" ? "Success!" : "Error"}
              </p>
              <p className="text-xs text-gray-400">{toast.message}</p>
            </div>
            <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}