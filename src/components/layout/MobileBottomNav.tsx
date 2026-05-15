"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Compass, Sparkles, Menu, X, FileText, Briefcase, TrendingUp, Sparkles as Diagnosis, Target, User, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CORE_NAV = [
  { label: "Home",      href: "/",          icon: Home },
  { label: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { label: "Pathways",  href: "/pathways",   icon: Compass },
  { label: "Assistant", href: "/assistant",  icon: Sparkles },
];

const MORE_NAV = [
  { label: "LMS / Workspace", href: "/lms",          icon: LayoutDashboard },
  { label: "Resume Engine",   href: "/resume",       icon: FileText },
  { label: "LinkedIn Toolkit", href: "/linkedin",    icon: Briefcase },
  { label: "Market Trends",    href: "/trends",       icon: TrendingUp },
  { label: "Diagnosis Report", href: "/diagnosis",   icon: Diagnosis },
  { label: "Skills Gap",       href: "/skills-gap",  icon: Target },
  { label: "My Profile",      href: "/profile",      icon: User },
  { label: "Portfolio",       href: "/portfolio",    icon: FolderOpen },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md flex md:hidden items-center justify-around px-2 py-2.5 bg-[#111827]/90 backdrop-blur-xl border border-[#1F2937] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50"
      >
        {CORE_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-[52px]"
            >
              <div className={`transition-all duration-200 ${active ? "text-[#D4AF37]" : "text-gray-500"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? "text-[#D4AF37]" : "text-gray-500"}`}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[#D4AF37]/10 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center p-2 min-w-[52px]"
        >
          <div className="text-gray-500">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-medium text-gray-500">More</span>
        </button>
      </nav>

      {/* Slide-up Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-[#1F2937] rounded-t-3xl z-[70] md:hidden pb-8"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
                <h3 className="text-lg font-semibold text-white">More Options</h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full bg-[#1A2236] text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="px-4 py-4 space-y-1">
                {MORE_NAV.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "text-gray-400 hover:bg-[#1A2236] hover:text-white"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? "text-[#D4AF37]" : ""}`} />
                      <span className="font-medium">{item.label}</span>
                      {active && (
                        <motion.div
                          layoutId="drawer-active"
                          className="ml-auto w-1.5 h-1.5 bg-[#D4AF37] rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}