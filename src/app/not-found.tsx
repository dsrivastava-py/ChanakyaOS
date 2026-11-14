import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#F3F4F6] p-4">
      <div className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">404</p>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-sm text-gray-400 mb-6">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-gradient-to-r from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
