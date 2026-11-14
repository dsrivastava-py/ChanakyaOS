import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Career strategy insights from ChanakyaOS. Subscribe for early access to new articles.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
