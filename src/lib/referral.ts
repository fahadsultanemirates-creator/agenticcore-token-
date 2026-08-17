// Referral reward structure: direct referral pays 20% of the referred purchase.
// Each level below decays to 70% of the level above it, through level 7.
export const REFERRAL_LEVELS = 7;
export const DIRECT_REFERRAL_PCT = 20;
export const LEVEL_DECAY_FACTOR = 0.7;

export interface ReferralLevelRate {
  level: number;
  pct: number;
}

export function getReferralLevelRates(): ReferralLevelRate[] {
  const rates: ReferralLevelRate[] = [];
  let pct = DIRECT_REFERRAL_PCT;
  for (let level = 1; level <= REFERRAL_LEVELS; level++) {
    rates.push({ level, pct: Math.round(pct * 1000) / 1000 });
    pct *= LEVEL_DECAY_FACTOR;
  }
  return rates;
}

export function formatPct(pct: number): string {
  return `${pct % 1 === 0 ? pct : pct.toFixed(2)}%`;
}
