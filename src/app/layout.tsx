import type { Metadata } from "next";
import "./globals.css";

import SyncProvider from "@/components/providers/SyncProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "ChanakyaOS — AI Career Intelligence",
  description: "An elite AI command center for career strategy. Stop guessing. Start strategizing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-full bg-[#0B0F19] text-[#F3F4F6]">
        <SyncProvider>
          {children}
          <MobileBottomNav />
        </SyncProvider>
      </body>
    </html>
  );
}
