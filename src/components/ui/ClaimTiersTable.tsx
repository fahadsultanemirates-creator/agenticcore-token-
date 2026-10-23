"use client";

import { useReadContract } from "wagmi";
import { Gift } from "lucide-react";
import { CLAIM_ABI } from "@/lib/contracts";
import { TOKEN, CLAIM_TIERS, formatSupply } from "@/lib/tokenConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/// Shown on both the landing page (no wallet needed -- this is a public
/// read) and the dashboard's ClaimCard, so it lives here rather than under
/// marketing/ or dashboard/. Renders nothing while claimContractAddress is
/// still the zero-address placeholder, same guard as ClaimCard.
export default function ClaimTiersTable({ compact = false }: { compact?: boolean }) {
  const claimConfigured = TOKEN.claimContractAddress.toLowerCase() !== ZERO_ADDRESS;

  const { data: claimsCountRaw } = useReadContract({
    address: TOKEN.claimContractAddress,
    abi: CLAIM_ABI,
    functionName: "claimsCount",
    query: { enabled: claimConfigured },
  });

  if (!claimConfigured) return null;

  const claimsCount = claimsCountRaw !== undefined ? Number(claimsCountRaw) : 0;
  let remaining = claimsCount;

  return (
    <div className={compact ? "" : "card-surface rounded-2xl p-6"}>
      {!compact && (
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-ac-violet-light" />
          <h3 className="text-base font-bold text-foreground">Welcome AC Community Gift</h3>
        </div>
      )}
      <div className={compact ? "space-y-2.5" : "mt-4 space-y-2.5"}>
        {CLAIM_TIERS.map((t) => {
          const claimedInTier = Math.max(0, Math.min(t.wallets, remaining));
          remaining -= claimedInTier;
          const pct = (claimedInTier / t.wallets) * 100;
          const full = claimedInTier >= t.wallets;

          return (
            <div key={t.tier} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-semibold text-ac-muted">
                Tier {t.tier}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {formatSupply(t.acEach)} AC{" "}
                    <span className="font-normal text-ac-muted">(${t.usdEach} each)</span>
                  </span>
                  <span className={full ? "text-ac-muted" : "text-ac-lime"}>
                    {claimedInTier}/{t.wallets} claimed
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ac-bg-elevated">
                  <div
                    className={`h-full rounded-full ${full ? "bg-ac-muted/50" : "bg-gradient-to-r from-ac-violet to-ac-lime"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-ac-muted/70">
        900 wallets total, first come first served — earlier claims get more AC, the gift tapers
        as each tier fills.
      </p>
    </div>
  );
}
