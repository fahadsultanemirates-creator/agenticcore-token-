// Referral reward structure: 10 fixed levels, paid in USDT (never in AC)
// out of live transaction flow. Direct (level 1) pays 20%; the remaining 9
// levels are fixed amounts, not a decay formula -- 20+10+5+5+2.5x6 = 55%
// of a referred purchase's USDT value paid out across the tree. The rest
// (after the 10% VIP Pool cut -- see VIP_POOL in tokenConfig.ts) goes to
// the company wallet. A purchase with no referral link pays 100% to the
// company wallet: no level commissions, no VIP Pool contribution.
export const REFERRAL_LEVELS = 10;
export const LEVEL_RATES_PCT = [20, 10, 5, 5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5] as const;

export interface ReferralLevelRate {
  level: number;
  pct: number;
}

export function getReferralLevelRates(): ReferralLevelRate[] {
  return LEVEL_RATES_PCT.map((pct, i) => ({ level: i + 1, pct }));
}

export function getTotalReferralPct(): number {
  return LEVEL_RATES_PCT.reduce((sum, pct) => sum + pct, 0);
}

export function formatPct(pct: number): string {
  return `${pct % 1 === 0 ? pct : pct.toFixed(2)}%`;
}
