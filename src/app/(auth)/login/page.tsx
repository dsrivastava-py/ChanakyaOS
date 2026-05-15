"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/onboarding");
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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#F3F4F6] p-4">
      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="ChanakyaOS"
            className="h-20 object-contain"
          />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37]/50 text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A2236] border border-[#1F2937] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37]/50 text-white" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Sign In
          </button>
        </form>

        <div className="my-6 flex items-center text-gray-500 text-sm">
          <div className="flex-1 border-t border-[#1F2937]"></div>
          <span className="px-4">or</span>
          <div className="flex-1 border-t border-[#1F2937]"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-900 font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <p className="mt-8 text-center text-sm text-gray-500">
          New to ChanakyaOS?{" "}
          <Link href="/signup" className="text-[#D4AF37] font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
