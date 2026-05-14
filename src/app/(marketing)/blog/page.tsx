"use client";

import { useState } from "react";

export default function BlogPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("A valid email is required.");
      return;
    }
    setError("");
    setSent(true);
    setEmail("");
  };

  return (
    <div className="bg-[#0B0F19] min-h-screen pt-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(212,175,55,0.05) 0%, transparent 70%)",
        }}
      />

      <section className="relative z-10 py-32 pb-40 container-marketing max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/06 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <span className="eyebrow" style={{ fontSize: "11px" }}>Intelligence Briefings</span>
        </div>

        <h1
          className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.06] mb-4"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          We operate in{" "}
          <span className="text-gradient-gold">stealth mode.</span>
        </h1>

        <p className="text-[#9CA3AF] text-lg mb-12 leading-relaxed max-w-xl mx-auto">
          The ChanakyaOS blog is being assembled. Career strategy dispatches,
          market intelligence, and system thinking — none of it ready for public
          release yet.
        </p>

        <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-[#F3F4F6] mb-2">
            Get notified when we launch.
          </p>
          <p className="text-xs text-[#6B7280] mb-6">
            First access to every dispatch. No spam, ever.
          </p>

          {sent ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/08">
              <span className="text-[#10B981] text-xl">✓</span>
              <p className="text-sm text-[#10B981] font-medium">You&apos;re on the list.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                id="blog-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-12 px-4 rounded-xl text-sm bg-[#0B0F19] border border-[#1F2937] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              />
              <button
                id="blog-submit-btn"
                type="submit"
                className="btn-primary h-12 px-8 text-sm rounded-xl whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
          {error && <p className="mt-3 text-xs text-[#EF4444]">{error}</p>}
        </div>
      </section>
    </div>
  );
}
