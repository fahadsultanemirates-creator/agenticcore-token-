"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConnectGate from "@/components/dashboard/ConnectGate";
import ReferralLinkCard from "@/components/dashboard/ReferralLinkCard";
import DemoModeBanner from "@/components/dashboard/DemoModeBanner";
import StatsOverview from "@/components/dashboard/StatsOverview";
import ReferralTreeView from "@/components/dashboard/ReferralTreeView";
import RewardStructureTable from "@/components/dashboard/RewardStructureTable";
import BuyWidget from "@/components/dashboard/BuyWidget";
import {
  generateMockReferralTree,
  summarizeTreeByLevel,
  totalReferrals,
} from "@/lib/mockReferralData";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const tree = useMemo(
    () => (address ? generateMockReferralTree(address) : []),
    [address]
  );
  const levelSummary = useMemo(() => summarizeTreeByLevel(tree), [tree]);
  const total = useMemo(() => totalReferrals(tree), [tree]);

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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReferralTreeView tree={tree} />
          </div>
          <div>
            <BuyWidget />
          </div>
        </div>

        <RewardStructureTable levelSummary={levelSummary} />
      </main>
    </>
  );
}
