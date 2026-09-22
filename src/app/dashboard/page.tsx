"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConnectGate from "@/components/dashboard/ConnectGate";
import ReferralLinkCard from "@/components/dashboard/ReferralLinkCard";
import DemoModeBanner from "@/components/dashboard/DemoModeBanner";
import StatsOverview from "@/components/dashboard/StatsOverview";
import ReferralLevelChart from "@/components/dashboard/ReferralLevelChart";
import VIPPoolCard from "@/components/dashboard/VIPPoolCard";
import ApexPoolCard from "@/components/dashboard/ApexPoolCard";
import MembershipCards from "@/components/dashboard/MembershipCards";
import ReferralTreeView from "@/components/dashboard/ReferralTreeView";
import RewardStructureTable from "@/components/dashboard/RewardStructureTable";
import BuyWidget from "@/components/dashboard/BuyWidget";
import ForgeChat from "@/components/dashboard/ForgeChat";
import {
  generateMockReferralTree,
  summarizeTreeByLevel,
  totalReferrals,
} from "@/lib/mockReferralData";
import { getNextPayoutAt, type VipPoolStatus } from "@/lib/mockVipPool";
import { getCardTierStatus } from "@/lib/cardTiers";
import { TOKEN, VIP_POOL } from "@/lib/tokenConfig";
import { SALE_ABI } from "@/lib/contracts";

const USDT_SCALE = BigInt("1000000000000000000");

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Referral tree/level breakdown is still the illustrative mock layout
  // (see DemoModeBanner) -- there's no live indexer yet. VIP/Apex
  // qualification below is real on-chain data, read directly off the Sale
  // contract.
  const tree = useMemo(
    () => (address ? generateMockReferralTree(address) : []),
    [address]
  );
  const levelSummary = useMemo(() => summarizeTreeByLevel(tree), [tree]);
  const total = useMemo(() => totalReferrals(tree), [tree]);

  const { data: purchasedRaw } = useReadContract({
    address: TOKEN.presaleContractAddress,
    abi: SALE_ABI,
    functionName: "totalPurchasedUsd",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const ownTotalInvestedUsd = purchasedRaw !== undefined ? Number(purchasedRaw) : 0;

  const { data: vipReads } = useReadContracts({
    contracts: address
      ? [
          { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "qualifiedSince", args: [address] },
          {
            address: TOKEN.presaleContractAddress,
            abi: SALE_ABI,
            functionName: "directReferralSalesUsd",
            args: [address],
          },
          { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "vipPoolBalance" },
          { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "totalQualifiedCount" },
          { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "nextPayoutTimestamp" },
          { address: TOKEN.presaleContractAddress, abi: SALE_ABI, functionName: "currentWeekId" },
        ]
      : undefined,
    query: { enabled: !!address },
  });

  const qualifiedSinceTs = vipReads?.[0]?.result !== undefined ? Number(vipReads[0].result) : 0;
  const directSalesUsd = vipReads?.[1]?.result !== undefined ? Number(vipReads[1].result) : 0;
  const poolSizeUsdt = vipReads?.[2]?.result !== undefined ? Number(vipReads[2].result) / Number(USDT_SCALE) : 0;
  const qualifiedMemberCount = vipReads?.[3]?.result !== undefined ? Number(vipReads[3].result) : 0;
  const nextPayoutTs = vipReads?.[4]?.result !== undefined ? Number(vipReads[4].result) : 0;
  const currentWeekId = vipReads?.[5]?.result !== undefined ? Number(vipReads[5].result) : 0;

  const isVipQualified = qualifiedSinceTs > 0;

  const vipStatus: VipPoolStatus = useMemo(
    () => ({
      qualifyingUsd: Math.max(ownTotalInvestedUsd, directSalesUsd),
      qualifyTargetUsd: VIP_POOL.qualifyUsd,
      isQualified: isVipQualified,
      poolSizeUsdt,
      qualifiedMemberCount,
      estimatedShareUsdt: isVipQualified && qualifiedMemberCount > 0 ? poolSizeUsdt / qualifiedMemberCount : 0,
      nextPayoutAt: nextPayoutTs > 0 ? new Date(nextPayoutTs * 1000) : getNextPayoutAt(),
    }),
    [ownTotalInvestedUsd, directSalesUsd, isVipQualified, poolSizeUsdt, qualifiedMemberCount, nextPayoutTs]
  );

  const cardStatus = useMemo(
    () =>
      getCardTierStatus({
        ownTotalInvestedUsd,
        vipQualified: isVipQualified,
        directSalesUsd,
      }),
    [ownTotalInvestedUsd, isVipQualified, directSalesUsd]
  );

  if (!isConnected || !address) {
    return (
      <>
        <DashboardHeader />
        <ConnectGate />
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-5 py-10 sm:px-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Your dashboard
          </h1>
          <p className="mt-1 text-sm text-ac-muted">
            Connected as <span className="font-mono text-foreground">{address}</span>
          </p>
        </div>

        <ReferralLinkCard address={address} />
        <DemoModeBanner />
        <StatsOverview totalReferrals={total} levelSummary={levelSummary} />

        {address && <MembershipCards address={address} status={cardStatus} />}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReferralLevelChart levelSummary={levelSummary} />
          </div>
          <div className="space-y-6">
            <VIPPoolCard
              status={vipStatus}
              address={address}
              qualifiedSinceTs={qualifiedSinceTs}
              currentWeekId={currentWeekId}
            />
            <ApexPoolCard directSalesUsd={directSalesUsd} vipStatus={vipStatus} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReferralTreeView tree={tree} />
          </div>
          <div>
            <BuyWidget />
          </div>
        </div>

        <RewardStructureTable levelSummary={levelSummary} />

        <ForgeChat address={address} />
      </main>
    </>
  );
}
