import type { Metadata } from "next";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export const metadata: Metadata = {
  title: "ChanakyaOS — Dashboard",
  description: "An elite AI command center for career strategy",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
