"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
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
import { getMockVipPoolStatus } from "@/lib/mockVipPool";
import { getCardTierStatus } from "@/lib/cardTiers";
import { TOKEN } from "@/lib/tokenConfig";
import { SALE_ABI } from "@/lib/contracts";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const tree = useMemo(
    () => (address ? generateMockReferralTree(address) : []),
    [address]
  );
  const levelSummary = useMemo(() => summarizeTreeByLevel(tree), [tree]);
  const total = useMemo(() => totalReferrals(tree), [tree]);
  const vipStatus = useMemo(
    () => (address ? getMockVipPoolStatus(address) : null),
    [address]
  );
  const directSalesUsd = levelSummary.find((l) => l.level === 1)?.volumeUsd ?? 0;

  const { data: purchasedRaw } = useReadContract({
    address: TOKEN.presaleContractAddress,
    abi: SALE_ABI,
    functionName: "totalPurchasedUsd",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const ownTotalInvestedUsd = purchasedRaw !== undefined ? Number(purchasedRaw) : 0;

  const cardStatus = useMemo(
    () =>
      getCardTierStatus({
        ownTotalInvestedUsd,
        vipQualified: vipStatus?.isQualified ?? false,
        directSalesUsd,
      }),
    [ownTotalInvestedUsd, vipStatus, directSalesUsd]
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
            {vipStatus && <VIPPoolCard status={vipStatus} />}
            {vipStatus && <ApexPoolCard directSalesUsd={directSalesUsd} vipStatus={vipStatus} />}
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
