import { Gift, Sparkles } from "lucide-react";
import { TOKEN, CLAIM_TIERS, formatSupply } from "@/lib/tokenConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/// Shown on both the landing page and the dashboard's ClaimCard, so it
/// lives here rather than under marketing/ or dashboard/. Deliberately
/// static -- no live claimed-count or USD-value display, by design: this
/// is a "limited wallets, be first" pitch, not a progress tracker. Renders
/// nothing while claimContractAddress is still the zero-address
/// placeholder, same guard as ClaimCard.
export default function ClaimTiersTable({ compact = false }: { compact?: boolean }) {
  const claimConfigured = TOKEN.claimContractAddress.toLowerCase() !== ZERO_ADDRESS;
  if (!claimConfigured) return null;

  return (
    <div className={compact ? "" : "card-surface rounded-2xl p-6"}>
      {!compact && (
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-ac-violet-light" />
          <h3 className="text-base font-bold text-foreground">Welcome AC Community Gift</h3>
        </div>
      )}
      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ac-lime">
        <Sparkles className="h-3.5 w-3.5" />
        Limited to the first 900 wallets — be among the first to claim.
      </div>
      <div className={compact ? "mt-3 space-y-2" : "mt-4 space-y-2"}>
        {CLAIM_TIERS.map((t) => (
          <div
            key={t.tier}
            className="flex items-center justify-between rounded-lg border border-ac-border/70 bg-ac-bg/50 px-3 py-2"
          >
            <span className="text-xs font-semibold text-ac-muted">
              Tier {t.tier} <span className="font-normal">({t.wallets} wallets)</span>
            </span>
            <span className="text-sm font-bold text-foreground">{formatSupply(t.acEach)} AC</span>
          </div>
        ))}
      </div>
    </div>
  );
}
