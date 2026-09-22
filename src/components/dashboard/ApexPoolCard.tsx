"use client";

import { Gem, CheckCircle2 } from "lucide-react";
import { APEX_POOL } from "@/lib/tokenConfig";
import type { VipPoolStatus } from "@/lib/mockVipPool";

// Apex Pool doesn't have its own separate weekly payout pot the way VIP
// does -- its reward is doubling whatever the VIP Pool already pays out,
// plus the referral-bonus and cross-family-discount benefits shown on the
// Apex AC Card above. This card just tracks qualification progress and, once
// qualified, what that doubling looks like against the current VIP numbers.
export default function ApexPoolCard({
  directSalesUsd,
  vipStatus,
}: {
  directSalesUsd: number;
  vipStatus: VipPoolStatus;
}) {
  const target = APEX_POOL.qualifyDirectSalesUsd;
  const isQualified = directSalesUsd >= target;
  const pct = Math.min(100, (directSalesUsd / target) * 100);
  const doubledShare = vipStatus.estimatedShareUsdt * APEX_POOL.vipPayoutMultiplier;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-ac-bg-card to-ac-bg-card p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/15 blur-[90px]"
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-amber-300" />
          <h2 className="text-lg font-bold text-foreground">Apex Pool</h2>
          {isQualified && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300">
              <CheckCircle2 className="h-3 w-3" />
              Qualified
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground/70">
          The tier above VIP — qualifies on your own direct (level-1) referral sales, not personal buys.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-ac-muted">
            <span>Direct sales progress</span>
            <span>
              ${directSalesUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / $
              {target.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ac-bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-foreground/60">
            {isQualified
              ? "Qualified for good — no need to hit this again."
              : `$${Math.max(0, target - directSalesUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} more in direct sales to go.`}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-ac-border/70 bg-ac-bg/50 p-3.5">
            <p className="text-[11px] uppercase tracking-wider text-ac-muted">Cross-family discount</p>
            <p className="mt-1 text-lg font-black text-amber-300">{APEX_POOL.crossFamilyDiscountPct}%</p>
          </div>
          <div className="rounded-xl border border-ac-border/70 bg-ac-bg/50 p-3.5">
            <p className="text-[11px] uppercase tracking-wider text-ac-muted">
              {isQualified && vipStatus.isQualified ? "Your doubled VIP payout" : "VIP payout multiplier"}
            </p>
            <p className="mt-1 text-lg font-black text-foreground">
              {isQualified && vipStatus.isQualified
                ? `$${doubledShare.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : `${APEX_POOL.vipPayoutMultiplier}x`}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-foreground/60">
          Referral link bonus jumps to +{APEX_POOL.referralBonusPct}% AC for your referrals once qualified.
        </p>
      </div>
    </div>
  );
}
