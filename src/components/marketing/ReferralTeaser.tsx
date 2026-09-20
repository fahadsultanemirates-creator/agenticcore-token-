"use client";

import { Network, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getReferralLevelRates, getTotalReferralPct, formatPct, REFERRAL_LEVELS } from "@/lib/referral";
import { VIP_POOL } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

export default function ReferralTeaser() {
  const rates = getReferralLevelRates();
  const totalPct = getTotalReferralPct();

  return (
    <section id="referral" className="relative mx-auto max-w-7xl overflow-hidden px-5 py-24 sm:px-8">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[400px] rounded-full bg-ac-violet/20 blur-[120px]"
        aria-hidden
      />
      <div className="relative">
      <SectionHeading
        eyebrow="Referral Program"
        title={`Get rewarded ${REFERRAL_LEVELS} levels deep.`}
        subtitle={`Every purchase made through your link — and your referrals' links, down to level ${REFERRAL_LEVELS} — pays out in USDT, up to ${formatPct(totalPct)} of the purchase split across the tree. On top of that, ${VIP_POOL.poolCutPct}% of every referred purchase feeds the weekly VIP Pool.`}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:items-center">
        <div className="lg:col-span-3">
          <div className="card-surface overflow-hidden rounded-2xl">
            <div className="grid grid-cols-3 gap-px bg-ac-border sm:grid-cols-5">
              {rates.map((r) => (
                <div
                  key={r.level}
                  className="flex flex-col items-center gap-1 bg-ac-bg-card px-2 py-5"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                    {r.level === 1 ? "Direct" : `Lvl ${r.level}`}
                  </span>
                  <span
                    className={`text-lg font-black sm:text-xl ${
                      r.level === 1 ? "text-ac-lime" : "text-foreground"
                    }`}
                  >
                    {formatPct(r.pct)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-foreground/60">
            Rates shown are a percentage of each downline purchase, paid in
            USDT to your wallet — never in AC. A direct (no-referral) buy
            pays 100% to the AgenticCore treasury instead: no commission, no
            VIP Pool contribution. Full tree visibility is available in your
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
            <p className="text-sm text-foreground/75">
              Connect your wallet to get a unique referral link, track every
              referral across all {REFERRAL_LEVELS} levels, watch your VIP
              Pool progress, and see your USDT rewards accrue in real time.
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
      </div>
    </section>
  );
}
