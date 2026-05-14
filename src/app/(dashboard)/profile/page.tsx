"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import {
  User,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Share2,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

export default function MyProfilePage() {
  const { profile, locked_pathway } = useUserStore();
  const [copied, setCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    // Generate public portfolio URL based on user name
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chanakyaos.com';
    const username = profile?.name?.toLowerCase().replace(/\s+/g, '-') || 'user';
    setPublicUrl(`${baseUrl}/portfolio/${username}`);
  }, [profile]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <header className="mb-4">
        <p className="text-accent text-sm font-medium tracking-[0.12em] uppercase mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          My Public Profile
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight leading-tight max-w-2xl">
          Share Your <span className="text-accent">Career Profile</span>
        </h1>
        <p className="text-gray-400 mt-2 max-w-xl">
          Generate a public link to showcase your skills, projects, and certifications to recruiters
        </p>
      </header>

      {/* Profile URL Card */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#D4AF37]/20 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Your Public Portfolio URL</h2>
            <p className="text-sm text-gray-400">Share this link with recruiters and potential employers</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 bg-[#0B0F19] border border-[#1F2937] rounded-xl px-6 py-4 overflow-hidden">
            <code className="text-[#D4AF37] text-lg truncate block">{publicUrl}</code>
          </div>
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
              copied
                ? "bg-[#10B981] text-white"
                : "bg-[#D4AF37] text-black hover:scale-105"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-4 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white hover:border-[#D4AF37]/30 transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Preview
          </a>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Your Public Profile Includes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-gray-300">Your name and professional headline</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-gray-300">Completed projects from your pathway</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-gray-300">Acquired skills and certifications</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-gray-300">Education background</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-gray-300">Links to LinkedIn & GitHub</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span className="text-gray-300">Your career bio</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/10 rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-accent" />
          Pro Tips for Sharing Your Profile
        </h3>
        <ul className="space-y-3 text-gray-400">
          <li>• Add your portfolio link to your LinkedIn profile's "Contact info"</li>
          <li>• Include it in your email signature when applying to jobs</li>
          <li>• Share it on LinkedIn after completing major certifications</li>
          <li>• Add it to your resume header as a clickable link</li>
        </ul>
      </div>

      {/* Current Status */}
      {locked_pathway && (
        <div className="bg-[#111827]/75 backdrop-blur-md border border-[#1F2937] rounded-3xl p-6">
          <h3 className="text-white font-semibold mb-4">Current Pathway: {locked_pathway.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full text-[#10B981] text-sm">
              {locked_pathway.projects?.filter(p => p.completed).length || 0} Projects Completed
            </span>
            <span className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-sm">
              {locked_pathway.skillChecklist?.filter(s => s.status === 'acquired').length || 0} Skills Acquired
            </span>
            <span className="px-3 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full text-[#3B82F6] text-sm">
              {locked_pathway.requirements?.filter(r => r.completed).length || 0} Certifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
}