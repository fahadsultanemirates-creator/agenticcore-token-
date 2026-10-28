"use client";

import { useState } from "react";
import { usePublicClient } from "wagmi";
import { Loader2, RefreshCw, Gift } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const CLAIM_CONFIGURED = TOKEN.claimContractAddress.toLowerCase() !== ZERO_ADDRESS;

// A standalone, single-item ABI (rather than pulling the event out of the
// shared CLAIM_ABI at runtime) so viem can fully infer the decoded log
// shape -- `find()`-ing it out of CLAIM_ABI loses that inference and the
// event's args end up typed as `never`.
const CLAIMED_EVENT_ABI = [
  {
    type: "event",
    name: "Claimed",
    inputs: [
      { name: "account", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "claimNumber", type: "uint256", indexed: false },
    ],
  },
] as const;

// How far back to scan for Claimed events. BSC produces ~28,800 blocks/day
// at ~3s each -- 400,000 blocks is a generous ~14 days of headroom past
// this contract's actual deployment, comfortably covering the whole
// campaign so far without needing to know the exact deployment block.
// Written via BigInt(...) rather than a `400000n` literal -- this project's
// ES2017 compile target doesn't support BigInt literal syntax.
const SCAN_BLOCKS = BigInt(400_000);
// Public RPC endpoints commonly cap eth_getLogs to a few thousand blocks
// per call, so the scan window is split into chunks and fetched in
// parallel rather than requested as one (likely-rejected) range.
const CHUNK_SIZE = BigInt(5_000);

interface ClaimEvent {
  txHash: string;
  account: string;
  amount: bigint;
  claimNumber: bigint;
}

export default function AdminRecentClaims() {
  const publicClient = usePublicClient();
  const [claims, setClaims] = useState<ClaimEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!publicClient) return;
    setLoading(true);
    setError(null);
    try {
      const latest = await publicClient.getBlockNumber();
      const earliest = latest > SCAN_BLOCKS ? latest - SCAN_BLOCKS : BigInt(0);

      const ranges: { fromBlock: bigint; toBlock: bigint }[] = [];
      for (let from = earliest; from <= latest; from += CHUNK_SIZE) {
        const upper = from + CHUNK_SIZE - BigInt(1);
        const to = upper > latest ? latest : upper;
        ranges.push({ fromBlock: from, toBlock: to });
      }

      const chunks = await Promise.all(
        ranges.map((r) =>
          publicClient.getLogs({
            address: TOKEN.claimContractAddress,
            event: CLAIMED_EVENT_ABI[0],
            fromBlock: r.fromBlock,
            toBlock: r.toBlock,
          })
        )
      );

      const rows: ClaimEvent[] = chunks
        .flat()
        .map((log) => ({
          txHash: log.transactionHash ?? "",
          account: log.args.account ?? "",
          amount: log.args.amount ?? BigInt(0),
          claimNumber: log.args.claimNumber ?? BigInt(0),
        }))
        .sort((a, b) => Number(b.claimNumber - a.claimNumber));

      setClaims(rows);
    } catch {
      setError("Couldn't load claim history from the chain -- try Refresh again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  if (!CLAIM_CONFIGURED) return null;

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-ac-violet-light" />
          <h2 className="text-lg font-bold text-foreground">Claim history</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-ac-border px-3 py-1 text-xs font-semibold text-ac-muted transition hover:text-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          {claims === null ? "Load claims" : "Refresh"}
        </button>
      </div>

      {claims === null && !loading && (
        <p className="mt-4 text-sm text-ac-muted">
          Reads directly from the chain (no indexer needed) -- tap Load claims to fetch who has claimed so far.
        </p>
      )}

      {loading && <p className="mt-4 text-sm text-ac-muted">Scanning the chain for claims…</p>}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {claims !== null && claims.length === 0 && !loading && (
        <p className="mt-4 text-sm text-ac-muted">No claims yet.</p>
      )}

      {claims !== null && claims.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-ac-muted">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Wallet</th>
                <th className="pb-2 font-medium">AC received</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.txHash} className="border-t border-ac-border">
                  <td className="py-2 pr-4 text-ac-muted">{c.claimNumber.toString()}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-foreground">
                    <a
                      href={`${TOKEN.bscScanBase}/tx/${c.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ac-lime hover:underline"
                    >
                      {c.account.slice(0, 6)}…{c.account.slice(-4)}
                    </a>
                  </td>
                  <td className="py-2 text-foreground">{(Number(c.amount) / 1e18).toLocaleString()} AC</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
