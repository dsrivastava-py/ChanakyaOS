"use client";

import { useState, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";
import { 
  FileText, 
  Briefcase as LinkedinIcon, 
  Download, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Sparkles,
  FileCode,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeEngine() {
  const { locked_pathway } = useUserStore();
  const [activeTab, setActiveTab] = useState<"resume" | "linkedin">("resume");
  const [resumeData, setResumeData] = useState({
    name: "Devansh Srivastava",
    email: "devansh@example.com",
    phone: "+91 9876543210",
    linkedin: "linkedin.com/in/devansh",
    github: "github.com/devansh",
    experience: [
      { company: "Tech Solutions", role: "Intern", period: "2023 - Present", desc: "Developing cloud-native applications." }
    ],
    skills: locked_pathway?.skillChecklist.map(s => s.skill).join(", ") || "Python, React, TypeScript"
  });

  const [linkedinPost, setLinkedinPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLatex = useMemo(() => {
    return `
\\section*{${resumeData.name}}
\\noindent \\textbf{Email:} ${resumeData.email} \\\\
\\noindent \\textbf{Phone:} ${resumeData.phone} \\\\
\\noindent \\textbf{Links:} ${resumeData.linkedin} | ${resumeData.github}

\\subsection*{Experience}
${resumeData.experience.map(exp => `
\\noindent \\textbf{${exp.company}} | ${exp.role} \\hfill ${exp.period} \\\\
\\noindent ${exp.desc}`).join("\n")}

\\subsection*{Skills}
\\noindent ${resumeData.skills}
    `.trim();
  }, [resumeData]);

  const handleDownloadPDF = async () => {
    const fullLatex = `
\\documentclass[10pt, letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\begin{document}
${generateLatex.replace(/\\\\/g, '\\')} 
\\end{document}
    `.trim();

    const encodedLatex = encodeURIComponent(fullLatex);
    // Open in new tab which will trigger the LaTeXOnline compilation and download
    window.open(`https://latexonline.cc/compile?text=${encodedLatex}`, '_blank');
  };

  const handleDownloadTex = () => {
    const fullLatex = `
\\documentclass[10pt, letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\begin{document}
${generateLatex}
\\end{document}
    `.trim();
    const element = document.createElement("a");
    const file = new Blob([fullLatex], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "resume.tex";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleGeneratePost = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-linkedin-post", {
        method: "POST",
        body: JSON.stringify({ 
          topic: locked_pathway?.title || "Career Growth",
          context: `Skills: ${resumeData.skills}. Target: ${locked_pathway?.title}`
        })
      });
      const data = await res.json();
      setLinkedinPost(data.post);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-semibold text-white">Identity & Resume Engine</h1>
          <p className="text-gray-400 mt-1">Export high-fidelity LaTeX resumes and optimize your social presence.</p>
        </div>
        
        <div className="flex bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
          <button 
            onClick={() => setActiveTab("resume")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'resume' ? 'bg-[#D4AF37] text-black' : 'text-gray-500 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Resume
          </button>
          <button 
            onClick={() => setActiveTab("linkedin")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'linkedin' ? 'bg-[#0077B5] text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <LinkedinIcon className="w-4 h-4" /> LinkedIn
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === "resume" ? (
          <motion.div 
            key="resume"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)]"
          >
            {/* Left Panel: Editor */}
            <div className="bg-[#111827]/50 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-8 overflow-y-auto custom-scrollbar">
              <h2 className="text-lg font-semibold text-white mb-6">Visual Editor</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Full Name</label>
                    <input 
                      value={resumeData.name} 
                      onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                      className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Email Address</label>
                    <input 
                      value={resumeData.email} 
                      onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                      className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 outline-none" 
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Experience</label>
                   <div className="space-y-4">
                     {resumeData.experience.map((exp, idx) => (
                       <div key={idx} className="p-4 bg-[#0B0F19] border border-[#1F2937] rounded-2xl relative group">
                         <input 
                           value={exp.company}
                           onChange={(e) => {
                             const newExp = [...resumeData.experience];
                             newExp[idx].company = e.target.value;
                             setResumeData({...resumeData, experience: newExp});
                           }}
                           placeholder="Company"
                           className="w-full bg-transparent text-white font-bold mb-1 outline-none"
                         />
                         <input 
                           value={exp.role}
                           onChange={(e) => {
                             const newExp = [...resumeData.experience];
                             newExp[idx].role = e.target.value;
                             setResumeData({...resumeData, experience: newExp});
                           }}
                           placeholder="Role"
                           className="w-full bg-transparent text-[#D4AF37] text-sm mb-2 outline-none"
                         />
                         <textarea 
                           value={exp.desc}
                           onChange={(e) => {
                             const newExp = [...resumeData.experience];
                             newExp[idx].desc = e.target.value;
                             setResumeData({...resumeData, experience: newExp});
                           }}
                           className="w-full bg-transparent text-gray-400 text-xs outline-none resize-none"
                           rows={2}
                         />
                         <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                     <button className="w-full py-3 border-2 border-dashed border-[#1F2937] rounded-2xl text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all flex items-center justify-center gap-2 text-sm">
                       <Plus className="w-4 h-4" /> Add Experience
                     </button>
                   </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Skills (Comma separated)</label>
                  <textarea 
                    value={resumeData.skills} 
                    onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                    className="w-full bg-[#0B0F19] border border-[#1F2937] rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 outline-none resize-none" 
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">LaTeX Live Preview</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-all" title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-all" title="Source Code">
                    <FileCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-white rounded-3xl p-12 text-black overflow-y-auto shadow-2xl relative group">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button 
                    onClick={handleDownloadPDF}
                    className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
                   >
                     <Download className="w-3 h-3" /> PDF
                   </button>
                   <button 
                    onClick={handleDownloadTex}
                    className="bg-gray-200 text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
                   >
                     <FileCode className="w-3 h-3" /> .tex
                   </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <Latex>{`$${generateLatex}$`}</Latex>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="linkedin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Mockups */}
            <div className="lg:col-span-2 space-y-8">
               {/* Header Mockup */}
               <div className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden shadow-xl">
                 <div className="h-32 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] relative">
                   <button className="absolute bottom-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white">
                     <Camera className="w-4 h-4" />
                   </button>
                 </div>
                 <div className="px-8 pb-8">
                   <div className="relative -mt-12 mb-4">
                     <div className="w-24 h-24 rounded-full border-4 border-[#111827] bg-gray-800 flex items-center justify-center overflow-hidden">
                       <ImageIcon className="w-8 h-8 text-gray-600" />
                     </div>
                     <button className="absolute bottom-0 left-16 p-1.5 bg-white rounded-full text-black shadow-lg">
                       <Plus className="w-3 h-3" />
                     </button>
                   </div>
                   <h3 className="text-xl font-bold text-white">{resumeData.name}</h3>
                   <p className="text-gray-400 text-sm">{locked_pathway?.title} | Aspiring Professional</p>
                   <div className="flex gap-2 mt-4">
                     <button className="px-6 py-1.5 bg-[#0077B5] text-white rounded-full text-sm font-bold">Open to</button>
                     <button className="px-6 py-1.5 border border-[#0077B5] text-[#0077B5] rounded-full text-sm font-bold">Add profile section</button>
                   </div>
                 </div>
               </div>

               {/* About Section */}
               <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-8 shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">About</h3>
                    <button className="text-[#0077B5] text-sm font-bold">Edit</button>
                 </div>
                 <p className="text-gray-400 text-sm leading-relaxed">
                   Passionate about {locked_pathway?.title}. Skilled in {resumeData.skills}. Currently focused on building strategic projects and expanding expertise in the field.
                 </p>
               </div>
            </div>

            {/* AI Post Generator */}
            <div className="bg-[#111827]/50 backdrop-blur-xl border border-[#0077B5]/20 rounded-3xl p-8 flex flex-col shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#0077B5]" />
                <h3 className="text-lg font-bold text-white">AI Post Generator</h3>
              </div>
              
              <div className="flex-1 bg-[#0B0F19] border border-[#1F2937] rounded-2xl p-6 mb-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-300 italic">
                {linkedinPost || 'Your AI-generated post will appear here...'}
              </div>

              <button 
                onClick={handleGeneratePost}
                disabled={isGenerating}
                className="w-full py-4 bg-[#0077B5] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#006699] transition-all disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? "Analyzing Market..." : "Generate Post Idea"}
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-4">Powered by Groq Llama-3.3-70b for maximum engagement.</p>
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
        .prose section {
          margin-bottom: 2rem;
        }
        .prose h2 {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
