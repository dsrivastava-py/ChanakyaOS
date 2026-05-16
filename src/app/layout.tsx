import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

import SyncProvider from "@/components/providers/SyncProvider";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import GuestWarningPopup from "@/components/ui/GuestWarningPopup";

export const metadata: Metadata = {
  title: "ChanakyaOS — AI Career Intelligence",
  description: "An elite AI command center for career strategy. Stop guessing. Start strategizing.",
  icons: {
    icon: "/logo-single.png",
    apple: "/logo-single.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-full bg-[#0B0F19] text-[#F3F4F6]">
        <Suspense fallback={null}>
          <SyncProvider>
            <GuestWarningPopup />
            {children}
            <MobileBottomNav />
          </SyncProvider>
        </Suspense>
      </body>
    </html>
  );
}
