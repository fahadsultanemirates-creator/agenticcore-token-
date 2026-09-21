"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareWarning, Check } from "lucide-react";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";

interface EscalationMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Escalation {
  id: string;
  channel: string;
  external_id: string;
  language: string | null;
  updated_at: string;
  recentMessages: EscalationMessage[];
}

const ENDPOINT = `${SUPABASE_URL}/functions/v1/admin-escalations`;

export default function AdminEscalations({ walletAddress }: { walletAddress: string }) {
  const [escalations, setEscalations] = useState<Escalation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  async function load() {
    setError(null);
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
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load escalations");
      setEscalations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escalations");
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  async function resolve(id: string) {
    setResolving(id);
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, action: "resolve", conversationId: id }),
      });
      setEscalations((prev) => prev?.filter((e) => e.id !== id) ?? null);
    } finally {
      setResolving(null);
    }
  }

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="h-4 w-4 text-ac-lime" />
          <h2 className="text-lg font-bold text-foreground">Escalated conversations</h2>
        </div>
        <button
          onClick={load}
          className="rounded-full border border-ac-border px-3 py-1 text-xs font-semibold text-ac-muted transition hover:text-foreground"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        Conversations the site chat, Forge, or Telegram bot flagged for human
        review (lost funds, security concerns, out-of-scope questions).
      </p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {!error && escalations === null && (
        <div className="mt-4 flex items-center gap-2 text-sm text-ac-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {escalations?.length === 0 && (
        <p className="mt-4 text-sm text-ac-muted">No open escalations. Nice.</p>
      )}

      <div className="mt-4 space-y-3">
        {escalations?.map((e) => (
          <div key={e.id} className="rounded-xl border border-ac-border bg-ac-bg/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-ac-muted">
                <span className="rounded-full border border-ac-border px-2 py-0.5 font-semibold uppercase tracking-wide text-foreground">
                  {e.channel}
                </span>{" "}
                <span className="font-mono">{e.external_id}</span>
                {e.language && <span> · {e.language}</span>}
                <span> · {new Date(e.updated_at).toLocaleString()}</span>
              </div>
              <button
                onClick={() => resolve(e.id)}
                disabled={resolving === e.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-ac-lime px-3 py-1 text-xs font-semibold text-ac-bg transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                {resolving === e.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Resolve
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              {e.recentMessages.map((m, i) => (
                <p key={i} className="text-xs leading-relaxed text-foreground/80">
                  <strong className={m.role === "user" ? "text-ac-cyan" : "text-ac-violet-light"}>
                    {m.role === "user" ? "User" : "Assistant"}:
                  </strong>{" "}
                  {m.content}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
