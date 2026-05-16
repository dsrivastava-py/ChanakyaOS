"use client";

import { useState } from "react";

/* Metadata can only be exported from server components;
   we keep the page "use client" for form state and
   add the meta via a separate metadata export approach.
   For stealth, we make this a client page with a form. */

export default function CareersPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("A valid email is required for clearance.");
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
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 70%)",
        }}
      />

      <section className="relative z-10 py-32 pb-40 w-full container-marketing max-w-3xl mx-auto text-center">
        {/* Redacted badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/06 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="eyebrow" style={{ fontSize: "11px" }}>CLEARANCE LEVEL: CLASSIFIED</span>
        </div>

        <h1
          className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.06] mb-6"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          Join the{" "}
          <span className="text-gradient-gold">Intelligence Agency.</span>
        </h1>

        <div className="glass-card rounded-2xl p-10 text-left max-w-2xl mx-auto">
          <div
            className="font-mono text-sm leading-relaxed text-[#9CA3AF] mb-8"
            style={{ borderLeft: "3px solid #D4AF37", paddingLeft: "20px" }}
          >
            <p>We operate in stealth.</p>
            <p className="mt-2">You&apos;ll know when we need you.</p>
            <p className="mt-2">
              ChanakyaOS is assembling a small, high-signal team of engineers, designers,
              and strategists who think in systems.
            </p>
            <p className="mt-2 text-[#D4AF37]">No job listings. No spray-and-pray.</p>
            <p className="mt-2">
              Leave your coordinates. We will reach out when the mission requires it.
            </p>
          </div>

          {sent ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/08">
              <span className="text-[#10B981] text-xl">✓</span>
              <div>
                <p className="text-sm font-semibold text-[#10B981]">Coordinates received.</p>
                <p className="text-xs text-[#6B7280] mt-0.5">You&apos;re on the list. Stay ready.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                id="careers-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-12 px-4 rounded-xl text-sm bg-[#0B0F19] border border-[#1F2937] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
              />
              <button
                id="careers-submit-btn"
                type="submit"
                className="btn-primary h-12 px-8 text-sm rounded-xl whitespace-nowrap"
              >
                Submit Coordinates
              </button>
            </form>
          )}
          {error && <p className="mt-3 text-xs text-[#EF4444]">{error}</p>}
        </div>
      </section>
    </div>
  );
}
