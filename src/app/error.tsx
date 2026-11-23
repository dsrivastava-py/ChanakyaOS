"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#F3F4F6] p-4">
      <div role="alert" className="w-full max-w-md bg-[#111827] border border-[#1F2937] rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">Unexpected error</p>
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-400 mb-6">
          The page failed to load. You can try again, or return to the home page.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8972A] text-[#0B0F19] font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="w-full bg-[#1A2236] border border-[#1F2937] text-gray-300 font-semibold py-2.5 rounded-lg hover:bg-[#252D45] transition-colors"
          >
            Back to home
          </a>
        </div>
        {error.digest && <p className="mt-4 text-[10px] text-gray-600">Reference: {error.digest}</p>}
      </div>
    </main>
  );
}
