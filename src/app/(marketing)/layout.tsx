import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: {
    template: "%s | ChanakyaOS",
    default: "ChanakyaOS — AI Career Intelligence",
  },
  description:
    "An elite AI command center for career strategy. Stop guessing. Start building the career you deserve.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />
      <main 
        className="pb-24 md:pb-0"
        style={{ position: "relative", zIndex: 3 }}
      >
        {children}
      </main>
      <MarketingFooter />
    </>
  );
}
