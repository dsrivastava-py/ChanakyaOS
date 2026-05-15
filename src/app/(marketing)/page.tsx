import type { Metadata } from "next";
import HomePageClient from "@/components/marketing/HomePageClient";

export const metadata: Metadata = {
  title: "ChanakyaOS — AI Career Intelligence Platform",
  description:
    "Stop guessing your career path. ChanakyaOS is an elite AI command center that analyzes your profile and builds the optimal pathway to your goals.",
};

export default function HomePage() {
  return <HomePageClient />;
}
