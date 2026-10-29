"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Eye } from "lucide-react";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/visit-stats`;

interface VisitStats {
  last24h: number;
  last7d: number;
  last14d: number;
  last30d: number;
  total: number;
}

export default function AdminVisits() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notDeployed, setNotDeployed] = useState(false);

  async function load() {
    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) {
        setNotDeployed(true);
        return;
      }
      const data = await resp.json();
      setStats(data);
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
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-ac-violet-light" />
          <h2 className="text-lg font-bold text-foreground">Page visits</h2>
        </div>
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

      {loading && stats === null && <p className="mt-4 text-sm text-ac-muted">Loading…</p>}

      {notDeployed && (
        <p className="mt-4 text-sm text-ac-muted">
          Live feed not reachable -- the track-visit/visit-stats functions may not be deployed yet.
        </p>
      )}

      {stats !== null && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Last 24h" value={stats.last24h} />
          <Stat label="Last 7 days" value={stats.last7d} />
          <Stat label="Last 14 days" value={stats.last14d} />
          <Stat label="Last 30 days" value={stats.last30d} />
          <Stat label="All time" value={stats.total} />
        </dl>
      )}
      <p className="mt-3 text-[11px] text-ac-muted/70">
        Page-view counts, not unique visitors -- one count per page load, across every page on the site.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ac-border bg-ac-bg/60 p-4 text-center">
      <dt className="text-xs text-ac-muted">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-foreground">{value.toLocaleString()}</dd>
    </div>
  );
}
