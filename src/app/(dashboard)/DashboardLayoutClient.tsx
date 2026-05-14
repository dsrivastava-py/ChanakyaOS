"use client";

import { LayoutDashboard, Route, FileText, Sparkles, Briefcase, LineChart, BookOpen, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserHeader from "@/components/layout/UserHeader";

const NAV_ITEMS = [
  { name: "Onboarding",         href: "/onboarding",   icon: Route },
  { name: "Pathways",           href: "/pathways",     icon: Route },
  { name: "Dashboard",          href: "/dashboard",    icon: LayoutDashboard },
  { name: "Diagnosis Report",   href: "/diagnosis",    icon: Sparkles },
  { name: "Skills Gap Analyzer",href: "/skills-gap",  icon: LineChart },
  { name: "Workspace / LMS",    href: "/lms",          icon: BookOpen },
  { name: "Resume Engine",      href: "/resume",       icon: FileText },
  { name: "LinkedIN Toolkit",  href: "/linkedin",     icon: Briefcase },
  { name: "Market Trends",     href: "/trends",       icon: LineChart },
  { name: "Your Chanakya",      href: "/assistant",    icon: Sparkles },
  { name: "My Profile",        href: "/profile",      icon: User },
];

import { useUserStore } from "@/store/useUserStore";
import EditProfileModal from "@/components/layout/EditProfileModal";
import SettingsModal from "@/components/layout/SettingsModal";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isEditProfileModalOpen, setEditProfileModalOpen } = useUserStore();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0B0F19] text-[#F3F4F6]">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111827] border-r border-[#1F2937] flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="group">
            <h2 className="text-xl font-bold font-display text-[#D4AF37]">
              Chanakya<span className="text-[#F3F4F6]">OS</span>
            </h2>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive 
                    ? "bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                    : "text-gray-400 hover:bg-[#1A2236] hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-black" : "text-[#D4AF37]/70"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navigation / Header */}
        <header className="h-20 flex items-center justify-end px-8 md:px-12 bg-[#0B0F19]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100]">
          <UserHeader />
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0B0F19] pb-24 md:pb-0 custom-scrollbar">
          <div className="p-6 md:p-12 mx-auto max-w-[1280px]">
            {children}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-6 left-6 right-6">
          <nav className="bg-[#111827]/80 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`p-3 rounded-xl transition-all ${
                    isActive ? "bg-[#D4AF37] text-black" : "text-gray-400"
                  }`}
                  title={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
        </div>
      </main>

      <EditProfileModal 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setEditProfileModalOpen(false)} 
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D4AF37;
        }
      `}</style>
    </div>
  );
}
