import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the ChanakyaOS team for support, feedback or partnerships.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
