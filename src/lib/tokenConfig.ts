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
  maxBuyUsd: 100,
  contractAddress: "0x00000000000000000000000000000000000000" as `0x${string}`,
  isContractLive: false,
  presaleContractAddress: "0x00000000000000000000000000000000000000" as `0x${string}`,
  bscScanBase: "https://bscscan.com",
  pancakeSwapUrl: "https://pancakeswap.finance",
};

export const TOKENOMICS = [
  { label: "Community & Referral Rewards", pct: 35, color: "var(--ac-violet)" },
  { label: "Liquidity Pool", pct: 25, color: "var(--ac-lime)" },
  { label: "Presale / Public Launch", pct: 20, color: "var(--ac-cyan)" },
  { label: "Ecosystem & Development", pct: 12, color: "#A78BFA" },
  { label: "Team (vested)", pct: 5, color: "#4C1D95" },
  { label: "Marketing", pct: 3, color: "#2DD4BF" },
] as const;

export function formatSupply(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toLocaleString()}T`;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString()}B`;
  return n.toLocaleString();
}
