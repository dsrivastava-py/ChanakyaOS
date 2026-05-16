"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // Create user record in our custom users table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          name: name
        });
      }
      alert("Verification email sent! Please check your inbox.");
      router.push("/login");
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#F3F4F6] p-4 font-sans">
      <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-[#1F2937] rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.png"
              alt="ChanakyaOS"
              className="h-20 object-contain mb-4"
            />
            <p className="text-gray-400 text-sm">Start your strategic career journey today.</p>
          </div>
          
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Full Name</label>
              <input 
                type="text" 
                placeholder="Chanakya Neeti"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1A2236]/50 border border-[#1F2937] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]/50 text-white placeholder:text-gray-600 transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="chanakya@empire.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A2236]/50 border border-[#1F2937] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]/50 text-white placeholder:text-gray-600 transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A2236]/50 border border-[#1F2937] rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]/50 text-white placeholder:text-gray-600 transition-all" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="my-8 flex items-center text-gray-500 text-[10px] uppercase tracking-[0.2em]">
            <div className="flex-1 border-t border-[#1F2937]"></div>
            <span className="px-4">Strategic Login</span>
            <div className="flex-1 border-t border-[#1F2937]"></div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-[#1A2236] border border-[#1F2937] text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-3 hover:bg-[#1f2937] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button 
              onClick={async () => {
                try {
                  await fetch('/api/auth/guest', { method: 'POST' });
                  useUserStore.setState({ isGuest: true, profile: { name: "GUEST" } });
                  router.push(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}mode=guest`);
                } catch (error) {
                  console.error("Guest login failed:", error);
                }
              }}
              className="w-full bg-[#1A2236]/30 border border-[#1F2937] text-gray-400 font-semibold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-[#1A2236]/50 transition-all hover:text-white"
            >
              Continue as Guest
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already a strategist?{" "}
            <Link href="/login" className="text-[#D4AF37] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
