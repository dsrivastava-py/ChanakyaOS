import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ChanakyaOS",
  description: "The terms and conditions governing your use of ChanakyaOS.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#0B0F19] min-h-screen pt-24">
      <article className="py-32 pb-40 container-marketing max-w-[700px] mx-auto relative z-10">
        <p className="eyebrow mb-5">Legal</p>
        <h1
          className="font-display font-bold text-[#F3F4F6] tracking-tight mb-4"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Terms of Service
        </h1>
        <p className="text-base text-[#6B7280] mb-16 font-mono">Last updated: May 2025</p>

        <div className="space-y-14">
          {[
            {
              title: "1. Acceptance of Terms",
              body: `By accessing and using ChanakyaOS ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.`,
            },
            {
              title: "2. Use of the Service",
              body: `ChanakyaOS is provided for personal, non-commercial career development purposes. You agree not to misuse the Service, including but not limited to: attempting to access others' accounts, using the Service for unlawful purposes, or reverse-engineering the platform.`,
            },
            {
              title: "3. User Content",
              body: `You retain ownership of all content you submit (resume, career information, etc.). By submitting content, you grant ChanakyaOS a limited license to use that content to provide and improve the Service. We do not claim ownership of your data.`,
            },
            {
              title: "4. AI-Generated Content",
              body: `ChanakyaOS uses artificial intelligence to generate career recommendations, pathway suggestions, and content improvements. AI-generated content is provided as guidance only and should not be treated as professional career counseling. You are responsible for all decisions made based on AI suggestions.`,
            },
            {
              title: "5. Limitation of Liability",
              body: `ChanakyaOS is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to lost career opportunities.`,
            },
            {
              title: "6. Changes to Terms",
              body: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated terms.`,
            },
            {
              title: "7. Contact",
              body: `For terms-related inquiries: legal@chanakyaos.com`,
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
