"use client";

import { useEffect, useState } from "react";
import { useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Gift, Loader2, CheckCircle2, AlertCircle, PartyPopper } from "lucide-react";
import { CLAIM_ABI } from "@/lib/contracts";
import { TOKEN, formatSupply } from "@/lib/tokenConfig";
import ClaimTiersTable from "@/components/ui/ClaimTiersTable";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function ClaimCard({ address }: { address: `0x${string}` }) {
  const claimConfigured = TOKEN.claimContractAddress.toLowerCase() !== ZERO_ADDRESS;

  const { data, refetch } = useReadContracts({
    contracts: [
      { address: TOKEN.claimContractAddress, abi: CLAIM_ABI, functionName: "hasClaimed", args: [address] },
      { address: TOKEN.claimContractAddress, abi: CLAIM_ABI, functionName: "nextClaimAmount" },
    ],
    query: { enabled: claimConfigured },
  });

  const alreadyClaimed = data?.[0]?.result as boolean | undefined;
  const nextClaim = data?.[1]?.result as [bigint, boolean] | undefined;
  const nextAmountAc = nextClaim ? Number(nextClaim[0]) / 1e18 : 0;
  const campaignOpen = nextClaim ? nextClaim[1] : false;

  const claim = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claim.data });

  useEffect(() => {
    if (!claimReceipt.isSuccess) return;
    refetch();
  }, [claimReceipt.isSuccess, refetch]);

  if (!claimConfigured) return null;
  if (!data) return null; // still loading -- avoid a flash of a wrong default state
  if (alreadyClaimed === undefined) return null; // read failed -- fail quiet, not broken-looking
  if (!alreadyClaimed && !campaignOpen) return null; // never claimed, but campaign over -- nothing to show

  const claiming = claim.isPending || claimReceipt.isLoading;
  const justClaimed = claimReceipt.isSuccess;

  const handleClaim = () => {
    claim.writeContract({
      address: TOKEN.claimContractAddress,
      abi: CLAIM_ABI,
      functionName: "claim",
    });
  };

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-ac-violet-light" />
        <h2 className="text-lg font-bold text-foreground">Welcome AC Community Gift</h2>
      </div>

      {alreadyClaimed || justClaimed ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-ac-lime">
          <PartyPopper className="h-4 w-4 shrink-0" />
          You&apos;ve claimed your free AC. Welcome to the community.
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ac-muted">
            One-time free AC for joining, no purchase needed — just connect and claim. Earlier claimers get
            more; the gift tapers as the pool fills.
          </p>
          <button
            type="button"
            disabled={claiming}
            onClick={handleClaim}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ac-violet px-5 py-3 text-sm font-bold text-ac-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {claiming ? "Claiming…" : `Claim ${formatSupply(nextAmountAc)} AC free`}
          </button>
        </>
      )}

      {claim.error && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          {claim.error.message}
        </p>
      )}

      <div className="mt-5 border-t border-ac-border/70 pt-4">
        <ClaimTiersTable compact />
      </div>
    </div>
  );
}
