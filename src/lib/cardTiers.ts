import {
  TOKEN,
  VIP_POOL,
  APEX_POOL,
  REFERRED_BUY_BONUS_PCT,
  VIP_CROSS_FAMILY_DISCOUNT_PCT,
} from "@/lib/tokenConfig";

// The three AC membership cards. Unlock conditions mix real on-chain data
// (own total invested, from the Sale contract's totalPurchasedUsd) with the
// same illustrative mock referral/VIP figures the rest of the dashboard
// already uses pending a real indexer -- see DemoModeBanner. What each card
// SHOWS once activated (name, total invested) is real; the bonus
// percentages and cross-family discounts described as benefits are the
// planned reward structure, not something the currently-deployed contract
// enforces per tier yet -- same "roadmap, not live" status as the existing
// family discount.
export type CardTierId = "standard" | "vip" | "apex";

export interface CardTier {
  id: CardTierId;
  name: string;
  poolName: string | null;
  tagline: string;
  benefits: string[];
}

export const CARD_TIERS: CardTier[] = [
  {
    id: "standard",
    name: "Standard AC Card",
    poolName: null,
    tagline: `Unlocked with your first buy ($${TOKEN.minBuyUsd}+)`,
    benefits: [`Your referral link mints your referrals +${REFERRED_BUY_BONUS_PCT}% extra AC`],
  },
  {
    id: "vip",
    name: "VIP AC Card",
    poolName: "VIP Pool",
    tagline: `Unlocked at $${VIP_POOL.qualifyUsd.toLocaleString()} in direct sales or personal buys`,
    benefits: [
      "Weekly USDT payout from the VIP Pool, every Sunday",
      `${VIP_CROSS_FAMILY_DISCOUNT_PCT}% off every AgenticCore family site — no AC needed to redeem`,
    ],
  },
  {
    id: "apex",
    name: "Apex AC Card",
    poolName: "Apex Pool",
    tagline: `Unlocked at $${APEX_POOL.qualifyDirectSalesUsd.toLocaleString()} in direct (level-1) sales`,
    benefits: [
      `${APEX_POOL.crossFamilyDiscountPct}% off every AgenticCore family site — no AC needed to redeem`,
      `Your referral link mints your referrals +${APEX_POOL.referralBonusPct}% extra AC, not just +${REFERRED_BUY_BONUS_PCT}%`,
      `${APEX_POOL.vipPayoutMultiplier}x your VIP Pool payout every week — same qualification, double the USDT`,
    ],
  },
];

export interface CardTierStatus {
  standardUnlocked: boolean;
  vipUnlocked: boolean;
  apexUnlocked: boolean;
  ownTotalInvestedUsd: number;
  directSalesUsd: number;
}

export function getCardTierStatus(params: {
  ownTotalInvestedUsd: number;
  vipQualified: boolean;
  directSalesUsd: number;
  // Marketing/demo override for the one admin wallet -- shows every card
  // unlocked regardless of real progress, so the design can be screenshotted
  // without actually hitting each threshold. Does NOT touch the real dollar
  // figures shown on the cards (ownTotalInvestedUsd/directSalesUsd stay
  // real), and never applies to anyone but the hardcoded admin address.
  previewUnlockAll?: boolean;
}): CardTierStatus {
  return {
    standardUnlocked: params.previewUnlockAll || params.ownTotalInvestedUsd >= TOKEN.minBuyUsd,
    vipUnlocked: params.previewUnlockAll || params.vipQualified,
    apexUnlocked: params.previewUnlockAll || params.directSalesUsd >= APEX_POOL.qualifyDirectSalesUsd,
    ownTotalInvestedUsd: params.ownTotalInvestedUsd,
    directSalesUsd: params.directSalesUsd,
  };
}

export function isTierUnlocked(status: CardTierStatus, id: CardTierId): boolean {
  if (id === "standard") return status.standardUnlocked;
  if (id === "vip") return status.vipUnlocked;
  return status.apexUnlocked;
}
