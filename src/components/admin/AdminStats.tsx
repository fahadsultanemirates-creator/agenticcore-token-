"use client";

import { useReadContracts } from "wagmi";
import { TOKEN } from "@/lib/tokenConfig";
import { SALE_ABI, TOKEN_ABI } from "@/lib/contracts";
import { formatSupply } from "@/lib/tokenConfig";

const saleContract = { address: TOKEN.presaleContractAddress, abi: SALE_ABI } as const;
const tokenContract = { address: TOKEN.contractAddress, abi: TOKEN_ABI } as const;

export default function AdminStats() {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...tokenContract, functionName: "owner" },
      { ...tokenContract, functionName: "antiWhaleActive" },
      { ...tokenContract, functionName: "totalSupply" },
      { ...saleContract, functionName: "owner" },
      { ...saleContract, functionName: "treasury" },
      { ...saleContract, functionName: "marketingWallet" },
      { ...saleContract, functionName: "currentWeekId" },
      { ...saleContract, functionName: "vipPoolBalance" },
      { ...saleContract, functionName: "nextPayoutTimestamp" },
      { ...saleContract, functionName: "totalQualifiedCount" },
    ],
  });

  const [
    tokenOwner,
    antiWhaleActive,
    totalSupply,
    saleOwner,
    treasury,
    marketingWallet,
    currentWeekId,
    vipPoolBalance,
    nextPayoutTimestamp,
    totalQualifiedCount,
  ] = data?.map((d) => d.result) ?? [];

  const nextPayout = nextPayoutTimestamp
    ? new Date(Number(nextPayoutTimestamp) * 1000).toUTCString()
    : "—";

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Contract state</h2>
        <button
          onClick={() => refetch()}
          className="rounded-full border border-ac-border px-3 py-1 text-xs font-semibold text-ac-muted transition hover:text-foreground"
        >
          Refresh
        </button>
      </div>
      {isLoading ? (
        <p className="mt-4 text-sm text-ac-muted">Loading on-chain state…</p>
      ) : (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Token owner" value={String(tokenOwner ?? "—")} mono />
          <Stat label="Sale owner" value={String(saleOwner ?? "—")} mono />
          <Stat
            label="Anti-whale cap"
            value={antiWhaleActive ? "Active" : "Disabled"}
            highlight={antiWhaleActive ? undefined : "text-red-400"}
          />
          <Stat label="Total supply" value={totalSupply ? formatSupply(Number(totalSupply) / 1e18) : "—"} />
          <Stat label="Treasury" value={String(treasury ?? "—")} mono />
          <Stat label="Marketing wallet" value={String(marketingWallet ?? "—")} mono />
          <Stat label="VIP pool balance (USDT, raw)" value={vipPoolBalance ? String(Number(vipPoolBalance) / 1e18) : "—"} />
          <Stat label="Current week" value={currentWeekId !== undefined ? String(currentWeekId) : "—"} />
          <Stat label="Qualified members" value={totalQualifiedCount !== undefined ? String(totalQualifiedCount) : "—"} />
          <Stat label="Next VIP payout (UTC)" value={nextPayout} />
        </dl>
      )}
    </div>
  );
}

function Stat({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: string }) {
  return (
    <div className="rounded-xl border border-ac-border bg-ac-bg/60 p-4">
      <dt className="text-xs text-ac-muted">{label}</dt>
      <dd className={`mt-1 break-all text-sm font-semibold ${highlight ?? "text-foreground"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
