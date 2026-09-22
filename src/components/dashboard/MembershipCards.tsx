"use client";

import { useEffect, useState } from "react";
import { Lock, CreditCard, Loader2, Sparkles } from "lucide-react";
import { CARD_TIERS, isTierUnlocked, type CardTierId, type CardTierStatus } from "@/lib/cardTiers";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";
import { TOKEN } from "@/lib/tokenConfig";

const ENDPOINT = `${SUPABASE_URL}/functions/v1/dashboard-cards`;

const TIER_CARD_STYLE: Record<CardTierId, string> = {
  standard: "border-ac-violet/40 bg-gradient-to-br from-ac-violet-dark/60 via-ac-bg-card to-ac-bg-elevated",
  vip: "border-ac-lime/40 bg-gradient-to-br from-ac-lime/20 via-ac-bg-card to-ac-bg-elevated",
  apex: "border-amber-400/50 bg-gradient-to-br from-amber-500/25 via-neutral-950 to-black",
};

const TIER_ACCENT_TEXT: Record<CardTierId, string> = {
  standard: "text-ac-violet-light",
  vip: "text-ac-lime",
  apex: "text-amber-300",
};

const TIER_GLOW: Record<CardTierId, string> = {
  standard: "bg-ac-violet/20",
  vip: "bg-ac-lime/20",
  apex: "bg-amber-400/25",
};

function maskedCardNumber(address: string): string {
  const clean = address.slice(2).toUpperCase();
  return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}

async function fetchCardName(walletAddress: string): Promise<string | null> {
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
  if (!resp.ok) throw new Error(data.error || "Failed to load card");
  return data.cardName ?? null;
}

async function saveCardName(walletAddress: string, cardName: string): Promise<string> {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, action: "save", cardName }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Failed to save card name");
  return data.cardName as string;
}

export default function MembershipCards({
  address,
  status,
}: {
  address: string;
  status: CardTierStatus;
}) {
  const [cardName, setCardName] = useState<string | null | undefined>(undefined); // undefined = loading
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const name = await fetchCardName(address);
        setCardName(name);
      } catch {
        setCardName(null);
      }
    })();
  }, [address]);

  const anyUnlocked = status.standardUnlocked || status.vipUnlocked || status.apexUnlocked;

  const handleActivate = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveCardName(address, trimmed);
      setCardName(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card name");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-ac-lime" />
        <h2 className="text-lg font-bold text-foreground">AC membership cards</h2>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        Three tiers, unlocked by what you and your team do on-chain. Benefits below describe the planned
        reward structure — bonus percentages and cross-family discounts are redeemed off-chain for now,
        the same roadmap status as the rest of the AgenticCore family discount.
      </p>

      {cardName === undefined ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-ac-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your cards…
        </div>
      ) : (
        <>
          {!cardName && anyUnlocked && (
            <div className="mt-5 rounded-xl border border-ac-lime/30 bg-ac-lime/5 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ac-lime" />
                <p className="text-sm font-semibold text-foreground">Activate your cards</p>
              </div>
              <p className="mt-1 text-xs text-ac-muted">
                Pick a name to print on every card you unlock — you can&apos;t change this later here, so
                choose something you&apos;re happy with.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  maxLength={40}
                  placeholder="Name for your card"
                  className="flex-1 rounded-xl border border-ac-border bg-ac-bg/70 px-4 py-2.5 text-sm text-foreground outline-none focus:border-ac-lime/60"
                />
                <button
                  type="button"
                  disabled={!draftName.trim() || saving}
                  onClick={handleActivate}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ac-lime px-5 py-2.5 text-sm font-bold text-ac-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-ac-border disabled:text-ac-muted"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Activate
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            </div>
          )}

          {!anyUnlocked && (
            <p className="mt-5 rounded-xl border border-dashed border-ac-border py-4 text-center text-sm text-ac-muted">
              Buy at least ${TOKEN.minBuyUsd} in AC to unlock your first card.
            </p>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {CARD_TIERS.map((tier) => {
              const unlocked = isTierUnlocked(status, tier.id);
              const activated = unlocked && !!cardName;

              return (
                <div key={tier.id}>
                  <div
                    className={`relative aspect-[1.586/1] overflow-hidden rounded-2xl border p-5 shadow-xl transition ${
                      TIER_CARD_STYLE[tier.id]
                    } ${!unlocked ? "opacity-50 grayscale" : ""}`}
                  >
                    <div
                      className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-[60px] ${TIER_GLOW[tier.id]}`}
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-foreground/90">
                          AgenticCore
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${TIER_ACCENT_TEXT[tier.id]}`}>
                          {tier.id === "standard" ? "Standard" : tier.id === "vip" ? "VIP" : "Apex"}
                        </span>
                      </div>

                      {activated ? (
                        <>
                          <p className="font-mono text-sm tracking-widest text-foreground/70">
                            {maskedCardNumber(address)}
                          </p>
                          <div>
                            <p className="truncate text-base font-bold text-foreground">{cardName}</p>
                            <p className="mt-0.5 text-xs text-foreground/60">
                              Total invested: ${status.ownTotalInvestedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                          <Lock className="h-6 w-6 text-foreground/50" />
                          <p className="text-xs text-foreground/60">
                            {unlocked ? "Set a name above to activate" : tier.tagline}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-bold text-foreground">{tier.name}</p>
                    {tier.poolName && <p className={`text-xs font-semibold ${TIER_ACCENT_TEXT[tier.id]}`}>{tier.poolName}</p>}
                    <ul className="mt-2 space-y-1">
                      {tier.benefits.map((b) => (
                        <li key={b} className="text-xs leading-relaxed text-ac-muted">
                          • {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
