import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Features",   href: "/#features" },
    { label: "Pricing",    href: "/pricing" },
  ],
  Company: [
    { label: "About",      href: "/about" },
    { label: "Blog",       href: "/blog" },
    { label: "Careers",    href: "/careers" },
    { label: "Contact",    href: "/contact" },
  ],
  Legal: [
    { label: "Privacy",    href: "/privacy" },
    { label: "Terms",      href: "/terms" },
  ],
};

export default function MarketingFooter() {
  return (
    <footer className="border-t border-[#1F2937] bg-[#0B0F19]" style={{ position: "relative", zIndex: 3 }}>
      {/* Top section */}
      <div className="container-marketing py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img
                src="/logo.png"
                alt="ChanakyaOS"
                className="h-11 object-contain"
              />
            </Link>
            <p className="text-[#9CA3AF] text-base leading-relaxed max-w-xs">
              An elite AI command center for career strategy. Stop guessing. Start building.
            </p>
            <div className="mt-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm text-[#6B7280]">Systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="eyebrow mb-6">{section}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base text-[#9CA3AF] hover:text-[#D4AF37] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1F2937]">
        <div className="container-marketing py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#6B7280]">
            © {new Date().getFullYear()} ChanakyaOS. Built with strategic intent.
          </p>
          <p className="text-sm text-[#6B7280] font-mono">
            v1.0.0 — <span className="text-[#D4AF37]">Intelligence Agency</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
