"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/recent-purchases`;

interface Purchase {
  tx_hash: string;
  block_timestamp: string | null;
  created_at: string;
  buyer_address: string;
  referrer_address: string;
  usdt_amount: number;
  ac_amount: number;
  referred: boolean;
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminRecentPurchases() {
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [notDeployed, setNotDeployed] = useState(false);

  // Loading starts true (initial state above) to cover the mount-triggered
  // fetch below without a synchronous setState call inside the effect
  // itself; the Refresh button sets it explicitly since that's a real
  // event handler, not an effect.
  async function load() {
    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: 25 }),
      });
      if (!resp.ok) {
        setNotDeployed(true);
        return;
      }
      const data = await resp.json();
      setPurchases(Array.isArray(data?.purchases) ? data.purchases : []);
    } catch {
      setNotDeployed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, []);

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Recent purchases</h2>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-ac-border px-3 py-1 text-xs font-semibold text-ac-muted transition hover:text-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Refresh
        </button>
      </div>

      {loading && purchases === null && (
        <p className="mt-4 text-sm text-ac-muted">Loading…</p>
      )}

      {notDeployed && (
        <p className="mt-4 text-sm text-ac-muted">
          Live feed not reachable -- the index-sale-events/referral-tree indexer
          may not be deployed yet, or this project&apos;s Supabase endpoint changed.
          Purchases are still visible directly on BscScan for the Sale contract
          in the meantime.
        </p>
      )}

      {purchases !== null && purchases.length === 0 && !notDeployed && (
        <p className="mt-4 text-sm text-ac-muted">No purchases indexed yet.</p>
      )}

      {purchases !== null && purchases.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-ac-muted">
                <th className="pb-2 pr-4 font-medium">Buyer</th>
                <th className="pb-2 pr-4 font-medium">USDT</th>
                <th className="pb-2 pr-4 font-medium">AC</th>
                <th className="pb-2 pr-4 font-medium">Referred</th>
                <th className="pb-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.tx_hash} className="border-t border-ac-border">
                  <td className="py-2 pr-4 font-mono text-xs text-foreground">
                    <a
                      href={`https://bscscan.com/tx/${p.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ac-lime hover:underline"
                    >
                      {shortAddr(p.buyer_address)}
                    </a>
                  </td>
                  <td className="py-2 pr-4 text-foreground">${p.usdt_amount.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-foreground">{p.ac_amount.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-ac-muted">{p.referred ? "Yes" : "No"}</td>
                  <td className="py-2 text-ac-muted">{timeAgo(p.block_timestamp ?? p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
