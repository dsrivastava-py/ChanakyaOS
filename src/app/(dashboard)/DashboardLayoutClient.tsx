"use client";

import Image from "next/image";
import { LayoutDashboard, Route, FileText, Sparkles, Briefcase, LineChart, BookOpen, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import UserHeader from "@/components/layout/UserHeader";
import { useUserStore } from "@/store/useUserStore";
import EditProfileModal from "@/components/layout/EditProfileModal";
import SettingsModal from "@/components/layout/SettingsModal";
import GuestWarningPopup from "@/components/ui/GuestWarningPopup";

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

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isEditProfileModalOpen, setEditProfileModalOpen } = useUserStore();

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0B0F19] text-[#F3F4F6] flex-col md:flex-row">
      
      {/* Desktop Sidebar (Strictly hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111827] border-r border-[#1F2937] flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="group">
            <img
              src="/logo.png"
              alt="ChanakyaOS"
              className="h-12 object-contain"
            />
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
      <main className="flex-1 flex flex-col min-w-0 relative h-full pb-24 md:pb-8">
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 items-center justify-end px-12 bg-[#0B0F19]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100]">
          <UserHeader />
        </header>

        {/* Mobile Header (Simplified, no hamburger) */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#111827] border-b border-white/5">
          <Link href="/" className="group">
            <img
              src="/logo.png"
              alt="ChanakyaOS"
              className="h-10 object-contain"
            />
          </Link>
          <UserHeader />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0B0F19] custom-scrollbar">
          <div className="p-4 md:p-12 mx-auto max-w-[1280px]">
            {children}
          </div>
        </div>
      </main>

      <EditProfileModal 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setEditProfileModalOpen(false)} 
      />

      <GuestWarningPopup />

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
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
