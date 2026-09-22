"use client";

import { Crown, CheckCircle2, Clock } from "lucide-react";
import type { VipPoolStatus } from "@/lib/mockVipPool";
import { VIP_POOL } from "@/lib/tokenConfig";
import VipClaimPanel from "@/components/dashboard/VipClaimPanel";

function formatCountdown(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "any moment now";
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export default function VIPPoolCard({
  status,
  address,
  qualifiedSinceTs,
  currentWeekId,
}: {
  status: VipPoolStatus;
  address: `0x${string}`;
  qualifiedSinceTs: number;
  currentWeekId: number;
}) {
  const pct = Math.min(100, (status.qualifyingUsd / status.qualifyTargetUsd) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ac-lime/25 bg-gradient-to-br from-ac-lime/10 via-ac-bg-card to-ac-bg-card p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ac-lime/15 blur-[90px]"
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-ac-lime" />
          <h2 className="text-lg font-bold text-foreground">VIP Pool</h2>
          {status.isQualified && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-ac-lime/15 px-2.5 py-1 text-[11px] font-bold text-ac-lime">
              <CheckCircle2 className="h-3 w-3" />
              Qualified
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground/70">
          {VIP_POOL.poolCutPct}% of every referred purchase feeds this pool,
          paid out in USDT every Sunday.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-ac-muted">
            <span>Qualification progress</span>
            <span>
              ${status.qualifyingUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} / $
              {status.qualifyTargetUsd.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ac-bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ac-cyan to-ac-lime transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-foreground/60">
            {status.isQualified
              ? "Qualified for good — no need to hit this again while the program runs."
              : `From your own direct referral sales or personal buys — $${Math.max(0, status.qualifyTargetUsd - status.qualifyingUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} to go.`}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-ac-border/70 bg-ac-bg/50 p-3.5">
            <p className="text-[11px] uppercase tracking-wider text-ac-muted">This week&apos;s pool</p>
            <p className="mt-1 text-lg font-black text-foreground">
              ${status.poolSizeUsdt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-xl border border-ac-border/70 bg-ac-bg/50 p-3.5">
            <p className="text-[11px] uppercase tracking-wider text-ac-muted">
              {status.isQualified ? "Your est. share" : "Qualified members"}
            </p>
            <p className="mt-1 text-lg font-black text-foreground">
              {status.isQualified
                ? `$${status.estimatedShareUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : status.qualifiedMemberCount}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-foreground/60">
          <Clock className="h-3.5 w-3.5 text-ac-cyan" />
          Next payout in {formatCountdown(status.nextPayoutAt)} (Sundays, 5pm GMT)
        </div>

        <VipClaimPanel address={address} qualifiedSinceTs={qualifiedSinceTs} currentWeekId={currentWeekId} />
      </div>
    </div>
  );
}
