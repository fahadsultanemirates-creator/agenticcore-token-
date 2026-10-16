import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";
import type { ReferralNode } from "@/lib/mockReferralData";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/referral-tree`;

// Returns the real referral tree once the index-sale-events indexer is
// deployed and has data for this wallet, or null on any failure (function
// not deployed yet, network error, wallet has no real referrals indexed).
// Callers should fall back to the mock tree on null -- see dashboard/page.tsx.
export async function fetchLiveReferralTree(walletAddress: string): Promise<ReferralNode[] | null> {
  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return Array.isArray(data?.tree) ? (data.tree as ReferralNode[]) : null;
  } catch {
    return null;
  }
}
