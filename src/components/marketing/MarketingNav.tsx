"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "About",    href: "/about" },
  { label: "Blog",     href: "/blog" },
  { label: "Careers",  href: "/careers" },
  { label: "Contact",  href: "/contact" },
];

export default function MarketingNav() {
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        id="marketing-nav"
        className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(11, 15, 25, 0.95)"
            : "rgba(11, 15, 25, 0.6)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: scrolled
            ? "1px solid rgba(212, 175, 55, 0.15)"
            : "1px solid rgba(31, 41, 55, 0.4)",
        }}
      >
        <div className="container-marketing h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Geometric mark */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0B0F19] font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)" }}
            >
              ◆
            </div>
            <span
              className="text-[22px] font-bold font-display text-[#F3F4F6] tracking-tight"
            >
              Chanakya<span className="text-[#D4AF37]">OS</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#9CA3AF] hover:text-[#D4AF37] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=signup"
              id="nav-cta-signup"
              className="btn-primary h-9 px-5 text-sm rounded-lg"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile CTA (Minimal) */}
          <div className="lg:hidden flex items-center gap-3">
             <Link
              href="/login"
              className="text-sm font-medium text-[#D4AF37]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
