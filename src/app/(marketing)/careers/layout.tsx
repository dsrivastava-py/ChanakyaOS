import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team building ChanakyaOS. Register your interest for future openings.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
