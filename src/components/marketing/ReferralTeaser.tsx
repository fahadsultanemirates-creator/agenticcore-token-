"use client";

import { Network, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getReferralLevelRates, formatPct } from "@/lib/referral";
import { SectionHeading } from "@/components/marketing/Tokenomics";

export default function ReferralTeaser() {
  const rates = getReferralLevelRates();

  return (
    <section id="referral" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="Referral Program"
        title="Get rewarded 7 levels deep."
        subtitle="Every purchase made through your link — and your referrals' links, down to level 7 — earns you AC. Direct referrals pay 20%; each level below decays to 70% of the level above."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:items-center">
        <div className="lg:col-span-3">
          <div className="card-surface overflow-hidden rounded-2xl">
            <div className="grid grid-cols-2 gap-px bg-ac-border sm:grid-cols-4">
              {rates.map((r) => (
                <div
                  key={r.level}
                  className={`flex flex-col items-center gap-1 bg-ac-bg-card px-3 py-6 ${
                    r.level === 1 ? "sm:col-span-1" : ""
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ac-muted">
                    {r.level === 1 ? "Direct" : `Level ${r.level}`}
                  </span>
                  <span
                    className={`text-xl font-black sm:text-2xl ${
                      r.level === 1 ? "text-ac-lime" : "text-foreground"
                    }`}
                  >
                    {formatPct(r.pct)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-ac-muted">
            Rates shown are a percentage of each downline purchase, paid in AC
            to your wallet. Full tree visibility is available in your
            dashboard once connected.
          </p>
        </div>

        <div className="lg:col-span-2">
          <div className="card-surface flex flex-col items-start gap-4 rounded-2xl p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ac-violet/15">
              <Network className="h-6 w-6 text-ac-violet-light" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              See your full referral tree
            </h3>
            <p className="text-sm text-ac-muted">
              Connect your wallet to get a unique referral link, track every
              referral across all 7 levels, and see your rewards accrue in
              real time.
            </p>
            <Link
              href="/dashboard"
              className="group mt-2 inline-flex items-center gap-2 rounded-full bg-ac-violet px-6 py-3 text-sm font-bold text-white transition hover:bg-ac-violet/90"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
