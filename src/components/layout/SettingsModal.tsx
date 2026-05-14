"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { X, Moon, Sun, Monitor, Bell, Shield, Smartphone, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [notifications, setNotifications] = useState(true);

  const sections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: Moon,
      description: "Customize your visual workspace experience",
      content: (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { id: "dark", label: "Dark", icon: Moon },
            { id: "light", label: "Light", icon: Sun },
            { id: "system", label: "System", icon: Monitor },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id as any)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                theme === option.id 
                  ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" 
                  : "bg-[#0B0F19] border-[#1F2937] text-gray-500 hover:border-gray-700"
              }`}
            >
              <option.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{option.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Manage how you receive strategy updates",
      content: (
        <div className="mt-4 flex items-center justify-between p-4 bg-[#0B0F19] border border-[#1F2937] rounded-2xl">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-gray-300">Push Notifications</span>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-all relative ${
              notifications ? "bg-[#D4AF37]" : "bg-gray-700"
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#0B0F19] transition-all ${
              notifications ? "left-7" : "left-1"
            }`} />
          </button>
        </div>
      )
    },
    {
      id: "security",
      title: "Security",
      icon: Shield,
      description: "Review your account security status",
      content: (
        <div className="mt-4 p-4 bg-[#0B0F19] border border-[#1F2937] rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">Two-Factor Authentication is active</span>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#111827] border border-[#D4AF37]/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white">System Settings</h2>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Configure your mission control</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                {sections.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-3 mb-1">
                      <section.icon className="w-4 h-4 text-[#D4AF37]" />
                      <h3 className="text-sm font-bold text-white">{section.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">{section.description}</p>
                    {section.content}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                >
                  Close Settings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
