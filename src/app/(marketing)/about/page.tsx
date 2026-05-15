import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — ChanakyaOS",
  description: "The story behind ChanakyaOS — built for the students and professionals who refuse to leave their careers to chance.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#0B0F19] min-h-screen pt-24">
      {/* Hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />
      <section className="relative z-10 py-32 pb-40 container-marketing">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Story */}
          <div>
            <p className="eyebrow mb-6">Our Story</p>
            <h1
              className="font-display font-bold text-[#F3F4F6] tracking-tight leading-[1.08] mb-8"
              style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
            >
              Built by those who lost<br />
              <span className="text-gradient-gold">years to confusion.</span>
            </h1>
            <div className="space-y-5 text-[#9CA3AF] text-base leading-relaxed">
              <p>
                ChanakyaOS was born from a simple frustration: India produces millions of graduates
                every year, and most of them have no idea how to translate their education into
                a career that actually fits them.
              </p>
              <p>
                We spent years on the wrong side of that equation &mdash; applying blindly, getting rejected
                without feedback, watching peers leapfrog ahead through connections we didn&apos;t have.
              </p>
              <p>
                Then we built the tool we wished existed. Not a job board. Not another resume builder.
                A strategic intelligence platform that thinks in systems, not steps.
              </p>
              <p>
                <span className="text-[#D4AF37] font-medium">Chanakya</span> — the ancient Indian
                strategist — saw the board entire before making a single move. That&apos;s the operating
                system we built for your career.
              </p>
            </div>
          </div>

          {/* Right: Stats card stack */}
          <div className="flex flex-col gap-4">
            {[
              { label: "Founded", value: "2026", sub: "Year zero for career intelligence" },
              { label: "Mission", value: "Clarity", sub: "Over confusion, every single time" },
              { label: "Philosophy", value: "Strategy", sub: "Not luck. Not hustle. Strategy." },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-6">
                <div className="eyebrow mb-1" style={{ color: "#6B7280" }}>{stat.label}</div>
                <div
                  className="font-display font-bold text-[#D4AF37] mb-1"
                  style={{ fontSize: "32px" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-[#6B7280]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 pb-40 bg-[#0F1520] relative z-10">
        <div className="container-marketing">
          <div className="text-center mb-16">
            <p className="eyebrow mb-4">Our Values</p>
            <h2
              className="font-display font-bold text-[#F3F4F6] tracking-tight"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              The principles we operate by.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "◆",
                title: "Radical Clarity",
                desc: "We don't sugarcoat. If your resume needs a rewrite, we say so. If your timeline is unrealistic, we recalculate. Truth first.",
              },
              {
                icon: "⬡",
                title: "Systems Thinking",
                desc: "Your career is a system, not a to-do list. We map the whole board before recommending the first move.",
              },
              {
                icon: "◈",
                title: "Earned Confidence",
                desc: "Not confidence from affirmations — confidence from preparation. We give you the data to know you're ready.",
              },
            ].map((v) => (
              <div key={v.title} className="card-feature">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[#D4AF37] text-lg mb-5"
                  style={{ background: "rgba(212,175,55,0.1)" }}
                >
                  {v.icon}
                </div>
                <h3 className="text-base font-semibold text-[#F3F4F6] mb-2">{v.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
