"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Cpu, FileText, Globe, Map, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";
import HeroCanvasAnimation from "./HeroCanvasAnimation";

/* ─── DATA ────────────────────────────────────────────────── */

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Deep Profile Analysis",
    desc: "ChanakyaOS ingests your resume, LinkedIn, and career goals. The engine maps every skill, gap, and opportunity across 10,000+ data points.",
    icon: Cpu,
  },
  {
    step: "02",
    title: "Strategic Pathway Generation",
    desc: "Not just one path — an entire map. The AI computes the optimal sequence of skills, projects, and applications to reach your target role.",
    icon: Map,
  },
  {
    step: "03",
    title: "Precision Execution",
    desc: "Resume bullets written for ATS. LinkedIn rewritten for discovery. Applications prioritized by match score. Every action is data-backed.",
    icon: FileText,
  },
  {
    step: "04",
    title: "Continuous Intelligence",
    desc: "The market changes. Your strategy adapts. ChanakyaOS monitors trends, alerts you to shifts, and recalculates your path in real time.",
    icon: TrendingUp,
  },
];

const BENTO_FEATURES = [
  {
    id: "resume",
    icon: FileText,
    title: "Resume Engine",
    desc: "ATS-optimized bullets written by AI. Keyword analysis, impact scoring, and formatting — tuned for your exact target role.",
    badge: "95% ATS Pass Rate",
    span: "lg:col-span-1 lg:row-span-2",
  },
  {
    id: "linkedin",
    icon: Globe,
    title: "LinkedIn Optimizer",
    desc: "Transform your profile into a recruiter magnet. Headline, About, and Skills rewritten for maximum discoverability.",
    badge: "4× More Views",
    span: "lg:col-span-1",
  },
  {
    id: "pathways",
    icon: Map,
    title: "AI Career Pathways",
    desc: "Visualize your entire career roadmap — milestones, required skills, and realistic timelines based on real market data.",
    badge: "Personalized Map",
    span: "lg:col-span-1",
  },
  {
    id: "assistant",
    icon: MessageSquare,
    title: "AI Career Assistant",
    desc: "Your strategic advisor, available 24/7. Ask anything — interview prep, salary negotiation, skill gaps, market trends.",
    badge: "Chanakya Intelligence",
    span: "lg:col-span-2",
  },
];

const TESTIMONIALS = [
  {
    quote: "It's like having a career strategist, resume writer, and market analyst in one. I got 3 interviews in my first week.",
    name: "Priya S.",
    role: "SWE → Product Manager",
  },
  {
    quote: "ChanakyaOS rebuilt my entire LinkedIn and resume overnight. The pathway map was the clarity I'd been missing for two years.",
    name: "Arjun K.",
    role: "Junior Dev → Senior Role",
  },
  {
    quote: "Finally an AI tool that actually understands the Indian job market. The salary benchmarks alone were worth it.",
    name: "Meera R.",
    role: "MBA Graduate",
  },
];

/* ─── ANIMATION VARIANTS ──────────────────────────────────── */

const fadeUpSection = {
  initial: { opacity: 0, y: 20 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  },
  viewport: { once: true, margin: "-50px" }
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: "-50px" }
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export default function HomePageClient() {
  return (
    <div className="overflow-x-hidden">
      {/* ══════════════ HERO ══════════════ */}
      <HeroCanvasAnimation />

      {/* ══════════════ SOCIAL PROOF BAR ══════════════ */}
      <motion.section 
        {...fadeUpSection}
        className="border-y border-[#1F2937] bg-[#0B0F19]" 
        style={{ position: "relative", zIndex: 3 }}
      >
        <div className="container-marketing py-12">
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {[
              ["12,000+", "Students Guided"],
              ["3", "Career Pathways Avg"],
              ["85%", "Report New Clarity"],
              ["4×", "More Recruiter Views"],
            ].map(([num, label]) => (
              <div key={label} className="flex items-center gap-4">
                <span className="font-data font-bold text-3xl text-[#F3F4F6]">{num}</span>
                <span className="text-base text-[#6B7280] leading-snug max-w-[100px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section id="how-it-works" className="py-40 bg-[#0B0F19]" style={{ position: "relative", zIndex: 3 }}>
        <div className="container-marketing">
          <motion.div 
            {...fadeUpSection}
            className="text-center mb-24"
          >
            <p className="eyebrow mb-5">How It Works</p>
            <h2
              className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.1]"
              style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
            >
              From scattered to <span className="text-gradient-gold">strategic</span><br />in four moves.
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute left-[calc(50%-1px)] top-0 bottom-0 w-px bg-gradient-to-b from-[#D4AF37] via-[#1F2937] to-transparent" />
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-col gap-20"
            >
              {HOW_IT_WORKS.map((item, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={item.step}
                    variants={fadeUp}
                    className={`flex flex-col lg:flex-row items-center gap-10 ${isEven ? "" : "lg:flex-row-reverse"}`}
                  >
                    <div className={`w-full lg:w-5/12 ${isEven ? "lg:text-right" : "lg:text-left"}`}>
                      <div className="card-standard p-8">
                        <div className="flex items-start gap-5">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)" }}>
                            <item.icon className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                          <div>
                            <div className="eyebrow mb-2" style={{ color: "#6B7280" }}>Step {item.step}</div>
                            <h3 className="text-xl font-semibold text-[#F3F4F6] mb-3">{item.title}</h3>
                            <p className="text-base text-[#9CA3AF] leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 z-10">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center font-data font-bold text-lg text-[#0B0F19] shadow-gold" style={{ background: "linear-gradient(135deg, #D4AF37, #B8972A)" }}>
                        {item.step}
                      </div>
                    </div>
                    <div className="hidden lg:block w-5/12" />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ BENTO FEATURE GRID ══════════════ */}
      <section id="features" className="py-40 bg-[#0F1520]" style={{ position: "relative", zIndex: 3 }}>
        <div className="container-marketing">
          <motion.div 
            {...fadeUpSection}
            className="text-center mb-20"
          >
            <p className="eyebrow mb-5">The Full Arsenal</p>
            <h2 className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.1]" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
              Every tool your career <span className="text-gradient-gold">needs to win.</span>
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {BENTO_FEATURES.map((feat) => (
              <motion.div key={feat.id} variants={fadeUp} className={`card-feature group relative overflow-hidden ${feat.span} p-9`}>
                <div className="w-10 h-0.5 bg-[#D4AF37] rounded-full mb-8" />
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <feat.icon className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-[#F3F4F6] mb-3">{feat.title}</h3>
                <p className="text-base text-[#9CA3AF] leading-relaxed">{feat.desc}</p>
                <div className="mt-8">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37" }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {feat.badge}
                  </span>
                </div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" style={{ background: "rgba(212,175,55,0.12)" }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section id="testimonials" className="py-40 bg-[#0B0F19]" style={{ position: "relative", zIndex: 3 }}>
        <div className="container-marketing">
          <motion.div {...fadeUpSection} className="text-center mb-24">
            <p className="eyebrow mb-5">Testimonials</p>
            <h2 className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.1]" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>
              Can&apos;t wait to review us? <span className="text-gradient-gold">We know&nbsp;;)</span>
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card rounded-2xl p-10 flex flex-col gap-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-[#D4AF37] text-lg">★</span>
                  ))}
                </div>
                <blockquote className="text-[#D0C5AF] text-base leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div>
                  <div className="text-base font-semibold text-[#F3F4F6]">{t.name}</div>
                  <div className="text-sm text-[#6B7280] mt-1">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <motion.section {...fadeUpSection} className="py-40 bg-[#0B0F19] overflow-hidden" style={{ position: "relative", zIndex: 3 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)" }} />
        <div className="container-marketing relative z-10 text-center">
          <p className="eyebrow mb-8">Ready?</p>
          <h2 className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.1] mb-8" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
            Your career deserves <span className="text-gradient-gold">strategy,</span><br />not guesswork.
          </h2>
          <p className="text-[#9CA3AF] text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Join thousands who replaced confusion with clarity.
          </p>
          <Link href="/onboarding" id="final-cta-button" className="btn-primary inline-flex h-16 px-14 text-lg rounded-xl gap-3">
            Start Free Analysis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
