"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  User,
  Mail,
  Globe,
  ExternalLink,
  Code,
  BookOpen,
  Award,
  Sparkles,
  Calendar,
  MapPin,
  Briefcase
} from "lucide-react";
import Link from "next/link";

interface PortfolioData {
  name: string;
  email: string;
  headline: string;
  bio: string;
  location: string;
  education: { institution: string; degree: string; year: string }[];
  skills: string[];
  projects: { title: string; description: string; techStack: string[]; link?: string }[];
  certifications: { name: string; provider: string; year: string }[];
  linkedin?: string;
  github?: string;
}

export default function PublicPortfolio() {
  const params = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const supabase = createClient();

        // Find user by name or username
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .or(`name.ilike.%${params.user}%,username.eq.${params.user}`)
          .maybeSingle();

        if (!profile) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Get locked pathway for portfolio data
        const { data: pathway } = await supabase
          .from('career_pathways')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('status', 'locked')
          .maybeSingle();

        // Build portfolio data
        const portfolioData: PortfolioData = {
          name: profile.name || "Professional",
          email: profile.email || "",
          headline: profile.headline || pathway?.pathway_data?.title || "Career Professional",
          bio: profile.bio || `Passionate professional specializing in ${pathway?.pathway_data?.title || "technology"}`,
          location: profile.location || "India",
          education: profile.education || [],
          skills: profile.skills || pathway?.pathway_data?.skillChecklist?.filter((s: { status: string }) => s.status === 'acquired').map((s: { skill: string }) => s.skill) || [],
          projects: pathway?.pathway_data?.projects?.filter((p: { completed?: boolean }) => p.completed).map((p: { title: string; description: string; techStack: string[] }) => ({
            title: p.title,
            description: p.description,
            techStack: p.techStack
          })) || [],
          certifications: pathway?.pathway_data?.requirements?.filter((r: { completed?: boolean }) => r.completed).map((r: { name: string; provider: string }) => ({
            name: r.name,
            provider: r.provider,
            year: new Date().getFullYear().toString()
          })) || [],
          linkedin: profile.linkedin_url,
          github: profile.github_url
        };

        setPortfolio(portfolioData);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.user) {
      fetchPortfolio();
    }
  }, [params.user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Portfolio Not Found</h1>
        <p className="text-gray-400 mb-8">This profile doesn't exist or hasn't been made public yet.</p>
        <Link href="/" className="text-[#D4AF37] hover:underline">
          Return to ChanakyaOS
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6]">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-[#D4AF37]/20 via-[#0B0F19] to-[#0B0F19]" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20 pb-8">
            <div className="w-32 h-32 rounded-2xl bg-[#111827] border-4 border-[#0B0F19] flex items-center justify-center">
              <User className="w-16 h-16 text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{portfolio.name}</h1>
              <p className="text-xl text-[#D4AF37] mb-2">{portfolio.headline}</p>
              <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                {portfolio.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {portfolio.location}
                  </span>
                )}
                {portfolio.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {portfolio.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {portfolio.linkedin && (
                <a
                  href={portfolio.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#0077B5] rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {portfolio.github && (
                <a
                  href={portfolio.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#111827] border border-[#1F2937] rounded-xl hover:border-[#D4AF37]/30 transition-all"
                >
                  <Code className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Skills */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                About
              </h2>
              <p className="text-gray-300 leading-relaxed">{portfolio.bio}</p>
            </div>

            {/* Skills */}
            {portfolio.skills.length > 0 && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#D4AF37]" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {portfolio.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-sm text-[#D4AF37]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {portfolio.education.length > 0 && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                  Education
                </h2>
                <div className="space-y-4">
                  {portfolio.education.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-[#D4AF37]/30 pl-4">
                      <h3 className="text-white font-medium">{edu.degree}</h3>
                      <p className="text-gray-400 text-sm">{edu.institution}</p>
                      <p className="text-gray-500 text-xs">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {portfolio.certifications.length > 0 && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  Certifications
                </h2>
                <div className="space-y-3">
                  {portfolio.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0F19] rounded-xl">
                      <div>
                        <h3 className="text-white text-sm font-medium">{cert.name}</h3>
                        <p className="text-gray-500 text-xs">{cert.provider}</p>
                      </div>
                      <span className="text-[#D4AF37] text-xs">{cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            {portfolio.projects.length > 0 && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                  Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-[#0B0F19] border border-[#1F2937] rounded-2xl hover:border-[#D4AF37]/30 transition-all group"
                    >
                      <h3 className="text-white font-semibold mb-2 group-hover:text-[#D4AF37] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.map((tech, i) => (
                          <span key={i} className="text-xs bg-[#111827] px-2 py-1 rounded text-gray-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#D4AF37] text-sm hover:underline"
                        >
                          View Project <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolio.projects.length === 0 && portfolio.certifications.length === 0 && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-12 text-center">
                <p className="text-gray-400">
                  This profile is still being built. Check back soon for projects and certifications.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1F2937] py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-2">Powered by</p>
          <Link href="/" className="text-xl font-bold text-[#D4AF37]">
            Chanakya<span className="text-white">OS</span>
          </Link>
          <p className="text-gray-600 text-xs mt-4">
            AI-Powered Career Operating System
          </p>
        </div>
      </footer>
    </div>
  );
}