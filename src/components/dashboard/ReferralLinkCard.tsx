"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { SITE_URL } from "@/lib/tokenConfig";

export default function ReferralLinkCard({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${SITE_URL}/?ref=${address}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select & copy manually
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ac-violet/30 bg-gradient-to-br from-ac-violet/20 via-ac-bg-card to-ac-bg-card p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-ac-violet/30 blur-[100px]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-ac-lime" />
          <span className="text-xs font-bold uppercase tracking-widest text-ac-lime">
            Your referral link
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 truncate rounded-xl border border-ac-border bg-ac-bg/70 px-4 py-3.5 font-mono text-sm text-foreground sm:text-base">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ac-lime px-6 py-3.5 text-sm font-bold text-black transition hover:brightness-95 active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Link
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-ac-muted">
          Share this link — every purchase made through it, and through your
          referrals&apos; links down to level 7, earns you AC.
        </p>
      </div>
    </div>
  );
}
