import { VIP_POOL } from "@/lib/tokenConfig";

// Demo-only VIP Pool state, deterministically derived from the wallet
// address (same pattern as mockReferralData/mockWalletActivity) so the
// dashboard has something realistic to render before a real indexer exists.
// Replace with a live data source once the contract + payout system ships.

export interface VipPoolStatus {
  qualifyingUsd: number;
  qualifyTargetUsd: number;
  isQualified: boolean;
  poolSizeUsdt: number;
  qualifiedMemberCount: number;
  estimatedShareUsdt: number;
  nextPayoutAt: Date;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0) / 4294967296;
}

// Next occurrence of VIP_POOL.payoutDayUtc / payoutHourUtc, in UTC -- if
// today already passed this week's payout hour, rolls to next week.
export function getNextPayoutAt(from: Date = new Date()): Date {
  const next = new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate(),
      VIP_POOL.payoutHourUtc,
      0,
      0,
      0
    )
  );
  const dayDiff = (VIP_POOL.payoutDayUtc - next.getUTCDay() + 7) % 7;
  next.setUTCDate(next.getUTCDate() + dayDiff);
  if (next.getTime() <= from.getTime()) {
    next.setUTCDate(next.getUTCDate() + 7);
  }
  return next;
}

export function getMockVipPoolStatus(address: string): VipPoolStatus {
  const seed = hashSeed(address.toLowerCase());
  // Spreads demo wallets from $0 up to 1.4x the qualify target, so a
  // realistic minority (~29%) already show as qualified.
  const qualifyingUsd = Math.round(seed * VIP_POOL.qualifyUsd * 1.4 * 100) / 100;
  const isQualified = qualifyingUsd >= VIP_POOL.qualifyUsd;
  const poolSizeUsdt = Math.round((4000 + seed * 12000) * 100) / 100;
  const qualifiedMemberCount = 8 + Math.floor(seed * 40);

  return {
    qualifyingUsd: Math.min(qualifyingUsd, VIP_POOL.qualifyUsd * 1.4),
    qualifyTargetUsd: VIP_POOL.qualifyUsd,
    isQualified,
    poolSizeUsdt,
    qualifiedMemberCount,
    estimatedShareUsdt: isQualified
      ? Math.round((poolSizeUsdt / qualifiedMemberCount) * 100) / 100
      : 0,
    nextPayoutAt: getNextPayoutAt(),
  };
}
