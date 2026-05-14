import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | ChanakyaOS",
  description: "Pricing models are currently in stealth mode. Early operators get in free.",
};

export default function PricingPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0F19]">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container-marketing relative z-10 text-center">
        {/* Eyebrow */}
        <div className="flex justify-center mb-8">
          <span className="eyebrow px-4 py-1 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            Economic Intelligence
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Can't wait to reward us? <br />
          <span className="text-gradient-gold">We know ;)</span>
        </h1>

        {/* Subtext */}
        <p className="text-[#9CA3AF] text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Pricing models are currently in stealth mode. <br className="hidden md:block" />
          Early operators get in free.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/login?mode=signup"
            className="btn-primary h-14 px-10 text-lg group"
          >
            Claim Early Access
            <svg
              className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="/contact"
            className="btn-secondary h-14 px-10 text-lg"
          >
            Inquire for Enterprise
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="mt-20 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-[#1F2937]"
                style={{
                  backgroundImage: `url('https://i.pravatar.cc/100?u=early-adopter-${i}')`,
                  backgroundSize: 'cover'
                }}
              />
            ))}
          </div>
          <p className="text-sm text-[#6B7280]">
            <span className="text-[#D4AF37] font-medium">842+</span> operators currently in stealth
          </p>
        </div>
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 gradient-strategic-grid opacity-[0.03] pointer-events-none" />
    </div>
  );
}
