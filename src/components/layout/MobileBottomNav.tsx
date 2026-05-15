"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Compass, User } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home",      href: "/",          icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pathways",  href: "/pathways",  icon: Compass },
  { label: "Profile",   href: "/profile",   icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex md:hidden items-center justify-around px-4 py-3 bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-full shadow-2xl z-50 transition-all"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link 
            key={item.href} 
            href={item.href}
            className="relative flex flex-col items-center justify-center p-2"
          >
            <div className={`transition-all duration-300 ${isActive ? "text-[#D4AF37] scale-110" : "text-slate-400"}`}>
              <Icon className="w-6 h-6" />
            </div>
            
            {isActive && (
              <motion.div 
                layoutId="nav-dot"
                className="absolute -bottom-1 w-1 h-1 bg-[#D4AF37] rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
