import { REFERRAL_LEVELS, getReferralLevelRates } from "@/lib/referral";
import { TOKEN } from "@/lib/tokenConfig";

// Demo-only referral tree, deterministically derived from the connected
// wallet address so the dashboard has something realistic to render before
// the contract (and the subgraph/indexer that will supply real tree data)
// exists. Replace with a live data source once the contract is deployed.

export interface ReferralNode {
  id: string;
  address: string;
  level: number;
  joinedDaysAgo: number;
  purchaseUsd: number;
  children: ReferralNode[];
}

export interface ReferralLevelSummary {
  level: number;
  pct: number;
  referralCount: number;
  volumeUsd: number;
  rewardAc: number;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (Math.imul(31, hash) + address.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function randomAddress(rng: () => number): string {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 40; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

function buildLevel(
  rng: () => number,
  level: number,
  path: string,
  branchCap: number
): ReferralNode[] {
  if (level > REFERRAL_LEVELS) return [];
  const count = Math.floor(rng() * (branchCap + 1));
  const nodes: ReferralNode[] = [];
  for (let i = 0; i < count; i++) {
    const id = `${path}-${level}-${i}`;
    // Purchases are bounded by the $100/wallet cap enforced at launch.
    const purchaseUsd = Math.round((10 + rng() * (TOKEN.maxBuyUsd - 10)) * 100) / 100;
    const nextBranchCap = Math.max(0, branchCap - 1);
    nodes.push({
      id,
      address: randomAddress(rng),
      level,
      joinedDaysAgo: Math.floor(rng() * 90),
      purchaseUsd,
      children: buildLevel(rng, level + 1, id, nextBranchCap),
    });
  }
  return nodes;
}

export function generateMockReferralTree(walletAddress: string): ReferralNode[] {
  const seed = hashAddress(walletAddress.toLowerCase());
  const rng = mulberry32(seed);
  return buildLevel(rng, 1, "root", 4);
}

export function summarizeTreeByLevel(tree: ReferralNode[]): ReferralLevelSummary[] {
  const rates = getReferralLevelRates();
  const byLevel = new Map<number, { count: number; volume: number }>();

  const walk = (nodes: ReferralNode[]) => {
    for (const node of nodes) {
      const bucket = byLevel.get(node.level) ?? { count: 0, volume: 0 };
      bucket.count += 1;
      bucket.volume += node.purchaseUsd;
      byLevel.set(node.level, bucket);
      walk(node.children);
    }
  };
  walk(tree);

  return rates.map((r) => {
    const bucket = byLevel.get(r.level) ?? { count: 0, volume: 0 };
    return {
      level: r.level,
      pct: r.pct,
      referralCount: bucket.count,
      volumeUsd: Math.round(bucket.volume * 100) / 100,
      // Illustrative AC reward at a placeholder $0.0000025/AC reference price.
      rewardAc: Math.round(((bucket.volume * r.pct) / 100 / 0.0000025) * 100) / 100,
    };
  });
}

export function totalReferrals(tree: ReferralNode[]): number {
  let total = 0;
  const walk = (nodes: ReferralNode[]) => {
    total += nodes.length;
    nodes.forEach((n) => walk(n.children));
  };
  walk(tree);
  return total;
}
