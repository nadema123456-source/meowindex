"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user dismissed the sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing sensible left to do
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-white bg-babyblue/70 px-5 py-2.5 text-sm font-bold text-ink shadow-clay-sm transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blossom"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path
          d="M12 3v12m0-12L8 7m4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
