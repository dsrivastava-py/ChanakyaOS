"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import EditProfileModal from "./EditProfileModal";

export default function UserHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const { profile, setEditProfileModalOpen } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = profile?.name 
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : "DS";

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#D4AF37]/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8972A] text-[#0B0F19] flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">
            {profile?.name || "Devansh Srivastava"}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
            Elite Strategist
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-[#111827] border border-[#1F2937] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <p className="text-xs font-bold text-white mb-0.5">{profile?.name || "Devansh Srivastava"}</p>
                <p className="text-[10px] text-gray-500 truncate">{userEmail || "Loading identity..."}</p>
              </div>

              <div className="p-2">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setEditProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                >
                  <UserIcon className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                  Edit Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                  <ShieldCheck className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                  Privacy
                </button>
              </div>

              <div className="p-2 border-t border-white/5">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
                >
                  <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
