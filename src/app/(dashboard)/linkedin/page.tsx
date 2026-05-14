"use client";

import { useUserStore } from "@/store/useUserStore";
import { Sparkles, Briefcase as LinkedinIcon, Target, User, Code2 } from "lucide-react";

export default function LinkedinOptimizer() {
  const { linkedin_health_score } = useUserStore();
  
  const circumference = 251.2;
  const progressOffset = circumference - (linkedin_health_score / 100) * circumference;

  return (
    <div className="flex flex-col gap-8">
      <header className="mb-4">
        <p className="text-[#3B82F6] text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
          <LinkedinIcon className="w-4 h-4" />
          LinkedIn AI Optimizer
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
          Stand out to <span className="text-[#3B82F6]">Indian Recruiters</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Ring */}
        <div className="lg:col-span-1 bg-[#111827]/75 backdrop-blur-md border border-[#3B82F6]/12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl p-8 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-white mb-8 self-start w-full">Profile Health</h2>
          <div className="relative w-56 h-56 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#3B82F6" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray={circumference} 
                strokeDashoffset={progressOffset} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-sans text-white tracking-tighter">{linkedin_health_score}<span className="text-3xl text-gray-400">%</span></span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-8 text-center">
            Your profile lacks ATS-friendly keywords for Data Analytics roles.
          </p>
        </div>

        {/* Improvement Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/20 shadow-md rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Rewrite Headline</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-md">Your current headline is too generic. Let AI inject high-impact keywords like &quot;Data Analytics&quot; and &quot;SQL&quot;.</p>
              </div>
            </div>
            <button className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>

          <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] shadow-md rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Optimize Summary</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-md">Draft a compelling &apos;About&apos; section that highlights your transition into Data Analytics.</p>
              </div>
            </div>
            <button className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-colors font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>

          <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] shadow-md rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Tag Skills Effectively</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-md">Add the top 5 emerging skills in your target field to bypass HR filters.</p>
              </div>
            </div>
            <button className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-colors font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
