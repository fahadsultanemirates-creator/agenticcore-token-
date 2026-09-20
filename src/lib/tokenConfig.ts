// Canonical production origin for building shareable links (referral links,
// OG tags). Deliberately not derived from window.location.origin — that
// would leak whatever host currently serves the page (localhost, a preview
// deployment) into links a user shares publicly.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agenticcore.io";

// Central config for the AgenticCore (AC) token.
// CONTRACT_ADDRESS is a placeholder until the audited BEP-20 contract ships —
// swap it in once deployed, everything downstream (buy widget, explorer links,
// dashboard balance reads) keys off this one constant.
export const TOKEN = {
  name: "AgenticCore",
  ticker: "AC",
  chain: "BNB Smart Chain",
  chainId: 56,
  standard: "BEP-20",
  totalSupply: 2_000_000_000_000, // 2 trillion
  decimals: 18,
  minBuyUsd: 5,
  maxBuyUsd: 1000,
  // Illustrative genesis price only -- not a peg or a promise, just what
  // "2T supply, presale allocation X%" implies at launch.
  startingPriceUsd: 0.0000001,
  contractAddress: "0x00000000000000000000000000000000000000" as `0x${string}`,
  isContractLive: false,
  presaleContractAddress: "0x00000000000000000000000000000000000000" as `0x${string}`,
  bscScanBase: "https://bscscan.com",
  pancakeSwapUrl: "https://pancakeswap.finance",
};

// Community & Referral Rewards (formerly a standalone 35% allocation) was
// folded away -- referral commissions and the VIP pool are now funded out
// of live transaction flow (see referral.ts / VIP_POOL in this file), not a
// pre-minted bucket. The freed-up 35% moved into Team (+10), Marketing
// (+27), with Ecosystem trimmed by 2 -- still exactly 100%.
export const TOKENOMICS = [
  { label: "Liquidity Pool", pct: 25, color: "var(--ac-lime)" },
  { label: "Presale / Public Launch", pct: 20, color: "var(--ac-cyan)" },
  { label: "Ecosystem & Development", pct: 10, color: "#A78BFA" },
  { label: "Team (vested)", pct: 15, color: "#4C1D95" },
  { label: "Marketing", pct: 30, color: "#2DD4BF" },
] as const;

// VIP Pool: 10% of every referred purchase's USDT value is swept into a
// weekly pool, paid out in USDT every Sunday to everyone who has ever hit
// the qualification threshold via their OWN direct referral sales or their
// own personal buy volume. Qualification is permanent once earned -- no
// re-qualifying each week.
export const VIP_POOL = {
  qualifyUsd: 1000,
  poolCutPct: 10,
  payoutDayUtc: 0, // Sunday
  payoutHourUtc: 17, // 5pm GMT
};

// A referred buy mints 10% more AC (same USD spend) than a direct,
// no-referral buy -- the incentive for using a referral link at all.
export const REFERRED_BUY_BONUS_PCT = 10;

// Plain template interpolation of a sub-cent number like 0.0000001 renders
// as "1e-7" (JS switches to exponential notation below 1e-6) -- always go
// through this instead of `${TOKEN.startingPriceUsd}` directly.
export function formatStartingPrice(): string {
  return `$${TOKEN.startingPriceUsd.toFixed(7)}`;
}

export function formatSupply(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toLocaleString()}T`;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString()}B`;
  return n.toLocaleString();
}
