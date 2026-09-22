"use client";

import { useEffect, useMemo, useState } from "react";
import { useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Gift, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { SALE_ABI } from "@/lib/contracts";
import { TOKEN } from "@/lib/tokenConfig";

const USDT_SCALE = BigInt("1000000000000000000");
// Only check the most recent windows worth of weeks -- an unclaimed share
// from further back is rare (qualification is permanent, so it would only
// happen from genuinely forgetting to claim) and this keeps the per-week
// multicall from growing unbounded as the program runs for years.
const MAX_WEEKS_TO_CHECK = 12;

interface ClaimableWeek {
  weekId: number;
  shareUsdt: number;
}

export default function VipClaimPanel({
  address,
  qualifiedSinceTs,
  currentWeekId,
}: {
  address: `0x${string}`;
  qualifiedSinceTs: number;
  currentWeekId: number;
}) {
  const startWeek = Math.max(0, currentWeekId - MAX_WEEKS_TO_CHECK);
  const weekIds = useMemo(
    () => Array.from({ length: Math.max(0, currentWeekId - startWeek) }, (_, i) => startWeek + i),
    [startWeek, currentWeekId]
  );

  const { data, refetch } = useReadContracts({
    contracts: weekIds.flatMap((weekId) => [
      {
        address: TOKEN.presaleContractAddress,
        abi: SALE_ABI,
        functionName: "hasClaimedWeek",
        args: [address, BigInt(weekId)],
      },
      { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "weekCloseTimestamp", args: [BigInt(weekId)] },
      { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "weekPoolTotal", args: [BigInt(weekId)] },
      {
        address: TOKEN.presaleContractAddress,
        abi: SALE_ABI,
        functionName: "weekQualifiedCountAtClose",
        args: [BigInt(weekId)],
      },
    ]),
    query: { enabled: qualifiedSinceTs > 0 && weekIds.length > 0 },
  });

  const claimableWeeks: ClaimableWeek[] = useMemo(() => {
    if (!data || qualifiedSinceTs === 0) return [];
    const rows: ClaimableWeek[] = [];
    weekIds.forEach((weekId, i) => {
      const hasClaimed = data[i * 4]?.result as boolean | undefined;
      const closeTs = data[i * 4 + 1]?.result as bigint | undefined;
      const poolTotal = data[i * 4 + 2]?.result as bigint | undefined;
      const qualifiedCount = data[i * 4 + 3]?.result as bigint | undefined;

      if (hasClaimed || !closeTs) return; // falsy also catches 0n (no week closed at this id)
      if (qualifiedSinceTs > Number(closeTs)) return; // qualified after this week closed
      if (!qualifiedCount) return;

      const shareRaw = (poolTotal ?? BigInt(0)) / qualifiedCount;
      if (!shareRaw) return;
      rows.push({ weekId, shareUsdt: Number(shareRaw) / Number(USDT_SCALE) });
    });
    return rows;
  }, [data, weekIds, qualifiedSinceTs]);

  const [pendingWeekId, setPendingWeekId] = useState<number | null>(null);
  const claim = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claim.data });

  useEffect(() => {
    if (!claimReceipt.isSuccess) return;
    refetch();
    const timeout = setTimeout(() => setPendingWeekId(null), 0);
    return () => clearTimeout(timeout);
  }, [claimReceipt.isSuccess, refetch]);

  if (qualifiedSinceTs === 0) return null;

  const handleClaim = (weekId: number) => {
    setPendingWeekId(weekId);
    claim.writeContract({
      address: TOKEN.presaleContractAddress,
      abi: SALE_ABI,
      functionName: "claimVipShare",
      args: [BigInt(weekId)],
    });
  };

  const claiming = claim.isPending || claimReceipt.isLoading;

  return (
    <div className="mt-4 rounded-xl border border-ac-border/70 bg-ac-bg/50 p-3.5">
      <div className="flex items-center gap-2">
        <Gift className="h-3.5 w-3.5 text-ac-lime" />
        <p className="text-xs font-semibold text-foreground">
          {claimableWeeks.length > 0 ? "Unclaimed VIP payouts" : "VIP payouts"}
        </p>
      </div>

      {claimableWeeks.length === 0 ? (
        <p className="mt-1.5 text-xs text-foreground/60">
          {currentWeekId === 0
            ? "No week has closed yet — check back after the first Sunday payout window."
            : "Nothing pending right now."}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {claimableWeeks.map((w) => (
            <div key={w.weekId} className="flex items-center justify-between gap-3">
              <span className="text-xs text-foreground/70">Week #{w.weekId}</span>
              <button
                type="button"
                disabled={claiming && pendingWeekId === w.weekId}
                onClick={() => handleClaim(w.weekId)}
                className="flex items-center gap-1.5 rounded-full bg-ac-lime px-3 py-1 text-xs font-bold text-ac-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {claiming && pendingWeekId === w.weekId ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Claim ${w.shareUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </button>
            </div>
          ))}
        </div>
      )}

      {claim.error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          {claim.error.message}
        </p>
      )}
    </div>
  );
}
