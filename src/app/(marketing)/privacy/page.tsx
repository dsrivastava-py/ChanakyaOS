import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ChanakyaOS",
  description: "How ChanakyaOS collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-[#0B0F19] min-h-screen pt-24">
      <article className="py-32 pb-40 container-marketing max-w-[700px] mx-auto relative z-10">
        <p className="eyebrow mb-5">Legal</p>
        <h1
          className="font-display font-bold text-[#F3F4F6] tracking-tight mb-4"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-base text-[#6B7280] mb-16 font-mono">Last updated: May 2025</p>

        <div className="prose-custom space-y-14">
          {[
            {
              title: "1. Information We Collect",
              body: `We collect information you provide directly to us, including your name, email address, resume content, career goals, and any other information you choose to share. We also collect usage data such as pages visited, features used, and interaction patterns to improve ChanakyaOS.`,
            },
            {
              title: "2. How We Use Your Information",
              body: `Your data powers your experience: generating career pathways, analyzing your resume, and personalizing AI recommendations. We do not sell your personal information to third parties. We may use anonymized, aggregated data for research and product improvement.`,
            },
            {
              title: "3. Data Storage & Security",
              body: `Your data is stored securely using industry-standard encryption. We use Supabase for database infrastructure with row-level security policies. All data transmissions are encrypted via TLS. We retain your data for as long as your account is active.`,
            },
            {
              title: "4. Third-Party Services",
              body: `ChanakyaOS uses third-party services including Google Gemini (AI generation), Supabase (database), and Vercel (hosting). Each of these services has their own privacy policies which govern their use of your data.`,
            },
            {
              title: "5. Your Rights",
              body: `You have the right to access, correct, or delete your personal data at any time. You may also request a copy of your data. To exercise these rights, contact us at privacy@chanakyaos.com.`,
            },
            {
              title: "6. Contact",
              body: `For privacy-related inquiries, contact us at: privacy@chanakyaos.com`,
            },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-[#F3F4F6] mb-4 font-sans">
                {section.title}
              </h2>
              <p className="text-base text-[#9CA3AF] leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
