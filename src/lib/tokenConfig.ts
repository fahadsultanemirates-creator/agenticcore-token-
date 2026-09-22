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
  contractAddress: "0xe9568888a0bc317519957047cf736e134B097768" as `0x${string}`,
  isContractLive: true,
  presaleContractAddress: "0xc9538dE177FD684704473041B81E2eC6CEc95679" as `0x${string}`,
  teamVestingAddress: "0xc319CE1fC59eCcCc5138FeDdDF025B520a6333EE" as `0x${string}`,
  marketingVestingAddress: "0x8B5AdB08D1550C8ef4621d335A9a495828035840" as `0x${string}`,
  usdtAddress: "0x55d398326f99059fF775485246999027B3197955" as `0x${string}`,
  bscScanBase: "https://bscscan.com",
  pancakeSwapUrl: "https://pancakeswap.finance",
  telegramBotUrl: "https://t.me/AgenticcoreACbot",
};

// The single wallet allowed into /admin. Client-side gate only -- every
// actual state-changing action there is separately enforced on-chain by
// the contracts' own onlyOwner (this address is the real Token/Sale owner
// from deployment), so a bypassed client check still can't do anything.
export const ADMIN_ADDRESS = "0x170BEc84cD2Be039C30BefE09a57f6a132cf5c60" as `0x${string}`;

// Fixed at deployment, minted once into these five destinations -- no mint
// function exists afterward. Liquidity and Presale are held directly and
// spendable now; Team and Marketing sit in on-chain VestingWallet contracts
// (see TOKEN.teamVestingAddress / marketingVestingAddress) releasing
// gradually over time rather than being available up front.
export const TOKENOMICS = [
  { label: "Liquidity Pool", pct: 35, color: "var(--ac-lime)" },
  { label: "Presale / Public Launch", pct: 35, color: "var(--ac-cyan)" },
  { label: "Ecosystem & Development", pct: 10, color: "#A78BFA" },
  { label: "Team (vested)", pct: 10, color: "#4C1D95" },
  { label: "Marketing (vested)", pct: 10, color: "#2DD4BF" },
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

// Apex Pool: the tier above VIP. Qualifies on OWN DIRECT (level-1) referral
// sales reaching this target -- unlike VIP, personal buy volume doesn't
// count here, it has to be sales you generated for the team. Once earned,
// permanent, same as VIP.
export const APEX_POOL = {
  qualifyDirectSalesUsd: 5000,
  crossFamilyDiscountPct: 30,
  referralBonusPct: 20,
  vipPayoutMultiplier: 2,
};

// A referred buy mints 10% more AC (same USD spend) than a direct,
// no-referral buy -- the incentive for using a referral link at all.
export const REFERRED_BUY_BONUS_PCT = 10;

// VIP-tier cross-family discount on AgenticCore sister businesses (site to
// site, redeemed off-chain -- same "planned, not live yet" status as the
// rest of the family-discount roadmap; see FamilyNetwork/roadmap copy).
export const VIP_CROSS_FAMILY_DISCOUNT_PCT = 15;

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
