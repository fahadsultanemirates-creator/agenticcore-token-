"use client";

import { useReadContracts } from "wagmi";
import { TOKEN } from "@/lib/tokenConfig";
import { SALE_ABI, TOKEN_ABI, ERC20_ABI } from "@/lib/contracts";
import { formatSupply } from "@/lib/tokenConfig";

const saleContract = { address: TOKEN.presaleContractAddress, abi: SALE_ABI } as const;
const tokenContract = { address: TOKEN.contractAddress, abi: TOKEN_ABI } as const;
const acAsErc20 = { address: TOKEN.contractAddress, abi: ERC20_ABI } as const;
const usdtAsErc20 = { address: TOKEN.usdtAddress, abi: ERC20_ABI } as const;

// The Presale/Public Launch tranche is a fixed 35% of the (also fixed,
// mint-once) total supply -- minted once into the Sale contract at
// deployment, never topped up again. So "AC remaining in the Sale
// contract" vs this constant is exactly "how much of the presale is sold",
// with no separate on-chain counter needed for it.
const PRESALE_ALLOCATION_AC = (TOKEN.totalSupply * 35) / 100;

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
      { ...acAsErc20, functionName: "balanceOf", args: [TOKEN.presaleContractAddress] },
      { ...acAsErc20, functionName: "balanceOf", args: [TOKEN.liquidityWalletAddress] },
      { ...acAsErc20, functionName: "balanceOf", args: [TOKEN.ecosystemWalletAddress] },
      { ...acAsErc20, functionName: "balanceOf", args: [TOKEN.teamVestingAddress] },
      { ...acAsErc20, functionName: "balanceOf", args: [TOKEN.marketingVestingAddress] },
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
    saleAcBalanceRaw,
    liquidityAcBalanceRaw,
    ecosystemAcBalanceRaw,
    teamVestingAcBalanceRaw,
    marketingVestingAcBalanceRaw,
  ] = data?.map((d) => d.result) ?? [];

  // Treasury/marketing-wallet addresses are only known once the first read
  // above resolves (they're read from the Sale contract, not a static
  // constant), so their USDT balances need a second, dependent read.
  const { data: usdtBalances } = useReadContracts({
    contracts: [
      { ...usdtAsErc20, functionName: "balanceOf", args: [(treasury as `0x${string}`) ?? TOKEN.presaleContractAddress] },
      { ...usdtAsErc20, functionName: "balanceOf", args: [(marketingWallet as `0x${string}`) ?? TOKEN.presaleContractAddress] },
    ],
    query: { enabled: !!treasury && !!marketingWallet },
  });
  const [treasuryUsdtRaw, marketingUsdtRaw] = usdtBalances?.map((d) => d.result) ?? [];

  const nextPayout = nextPayoutTimestamp
    ? new Date(Number(nextPayoutTimestamp) * 1000).toUTCString()
    : "—";

  const saleAcRemaining = saleAcBalanceRaw !== undefined ? Number(saleAcBalanceRaw) / 1e18 : undefined;
  const acSold = saleAcRemaining !== undefined ? PRESALE_ALLOCATION_AC - saleAcRemaining : undefined;
  const pctSold = acSold !== undefined ? (acSold / PRESALE_ALLOCATION_AC) * 100 : undefined;
  const usdRaised = acSold !== undefined ? acSold * TOKEN.startingPriceUsd : undefined;

  const fmtAc = (raw: unknown) => (raw !== undefined ? formatSupply(Number(raw) / 1e18) : "—");
  const fmtUsdt = (raw: unknown) =>
    raw !== undefined ? `$${(Number(raw) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—";

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
        <>
        <div className="mt-4 rounded-xl border border-ac-violet/25 bg-ac-violet/10 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ac-muted">Presale progress</p>
            <p className="text-xs text-ac-muted">{pctSold !== undefined ? `${pctSold.toFixed(4)}% sold` : "—"}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ac-bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ac-violet to-ac-lime transition-all"
              style={{ width: `${Math.min(100, pctSold ?? 0)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="AC sold" value={acSold !== undefined ? formatSupply(acSold) : "—"} />
            <MiniStat label="AC remaining" value={saleAcRemaining !== undefined ? formatSupply(saleAcRemaining) : "—"} />
            <MiniStat label="Presale allocation" value={formatSupply(PRESALE_ALLOCATION_AC)} />
            <MiniStat
              label="USDT raised (est.)"
              value={usdRaised !== undefined ? `$${usdRaised.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
            />
          </div>
          <p className="mt-2 text-[11px] text-ac-muted/70">
            Estimated at the fixed starting price -- doesn&apos;t account for the 10% referral AC bonus, which
            mints slightly more AC per USDT than this estimate assumes.
          </p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ac-muted">
            Where the 2T supply lives
          </p>
          <p className="mt-1 text-[11px] text-ac-muted/70">
            Fixed at deployment, split five ways, no mint function afterward -- this is the complete
            picture, nothing else holds AC. Presale is covered above; these are the other four.
          </p>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Liquidity wallet (35%)" value={fmtAc(liquidityAcBalanceRaw)} highlight="text-ac-violet-light" />
            <Stat label="Ecosystem wallet (10%)" value={fmtAc(ecosystemAcBalanceRaw)} highlight="text-ac-violet-light" />
            <Stat label="Team VestingWallet (10%)" value={fmtAc(teamVestingAcBalanceRaw)} highlight="text-ac-violet-light" />
            <Stat label="Marketing VestingWallet (10%)" value={fmtAc(marketingVestingAcBalanceRaw)} highlight="text-ac-violet-light" />
          </dl>
          <p className="mt-2 text-[11px] text-ac-muted/70">
            Liquidity funds the eventual PancakeSwap pool -- once that&apos;s live, AC also becomes
            available there directly, outside the Sale contract and its $5-$1,000 per-wallet cap. The
            Sale contract only ever holds the Presale 700B; when that runs out, buy() has nothing left
            to pay out unless it&apos;s topped up from elsewhere on purpose -- there is no automatic
            next tranche.
          </p>
        </div>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Token owner" value={String(tokenOwner ?? "—")} mono />
          <Stat label="Sale owner" value={String(saleOwner ?? "—")} mono />
          <Stat
            label="Anti-whale cap"
            value={antiWhaleActive ? "Active" : "Disabled"}
            highlight={antiWhaleActive ? undefined : "text-red-400"}
          />
          <Stat label="Total supply" value={totalSupply ? formatSupply(Number(totalSupply) / 1e18) : "—"} />
          <Stat label="Treasury" value={String(treasury ?? "—")} sub={`${fmtUsdt(treasuryUsdtRaw)} USDT`} mono />
          <Stat label="Marketing wallet" value={String(marketingWallet ?? "—")} sub={`${fmtUsdt(marketingUsdtRaw)} USDT`} mono />
          <Stat label="VIP pool balance (USDT, raw)" value={vipPoolBalance ? String(Number(vipPoolBalance) / 1e18) : "—"} />
          <Stat label="Current week" value={currentWeekId !== undefined ? String(currentWeekId) : "—"} />
          <Stat label="Qualified members" value={totalQualifiedCount !== undefined ? String(totalQualifiedCount) : "—"} />
          <Stat label="Next VIP payout (UTC)" value={nextPayout} />
        </dl>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  highlight?: string;
}) {
  return (
    <div className="rounded-xl border border-ac-border bg-ac-bg/60 p-4">
      <dt className="text-xs text-ac-muted">{label}</dt>
      <dd className={`mt-1 break-all text-sm font-semibold ${highlight ?? "text-foreground"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
      {sub && <dd className="mt-1 text-xs font-semibold text-ac-lime">{sub}</dd>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-ac-muted">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
