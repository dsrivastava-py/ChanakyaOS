"use client";

import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GuestWarningPopup() {
  const { isGuest } = useUserStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isGuest) {
      const hasSeenWarning = sessionStorage.getItem("hasSeenGuestWarning");
      if (!hasSeenWarning) {
        setIsVisible(true);
      }
    }
  }, [isGuest]);

  const closeWarning = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenGuestWarning", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[#111827] border border-[#D4AF37]/30 rounded-3xl p-8 shadow-[0_20px_50px_rgba(212,175,55,0.15)] relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
            
            <button 
              onClick={closeWarning}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6 border border-[#D4AF37]/20">
                <AlertTriangle className="w-8 h-8 text-[#D4AF37]" />
              </div>
              
              <h2 className="text-2xl font-display font-semibold text-white mb-2">Welcome to Guest Mode!</h2>
              <p className="text-gray-400 mb-8">
                You can explore all premium features, but your data is <span className="text-white font-bold">temporary</span> and will vanish if you refresh the page.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={closeWarning}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all"
                >
                  Start Exploring
                </button>
                <Link 
                  href="/signup"
                  className="w-full py-3.5 bg-[#1A2236] border border-[#1F2937] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#252D45] transition-all"
                >
                  Create Permanent Account <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
