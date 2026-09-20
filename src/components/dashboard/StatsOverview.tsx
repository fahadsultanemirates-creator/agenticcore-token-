import { Users, Coins, TrendingUp, Layers } from "lucide-react";
import type { ReferralLevelSummary } from "@/lib/mockReferralData";
import { REFERRAL_LEVELS } from "@/lib/referral";

export default function StatsOverview({
  totalReferrals,
  levelSummary,
}: {
  totalReferrals: number;
  levelSummary: ReferralLevelSummary[];
}) {
  const totalVolume = levelSummary.reduce((sum, l) => sum + l.volumeUsd, 0);
  const totalRewardUsdt = levelSummary.reduce((sum, l) => sum + l.rewardUsdt, 0);
  const activeLevels = levelSummary.filter((l) => l.referralCount > 0).length;

  const stats = [
    { icon: Users, label: "Total Referrals", value: totalReferrals.toLocaleString() },
    {
      icon: Coins,
      label: "Est. Rewards Earned",
      value: `$${totalRewardUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT`,
    },
    {
      icon: TrendingUp,
      label: "Downline Volume",
      value: `$${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    },
    { icon: Layers, label: "Active Levels", value: `${activeLevels} / ${REFERRAL_LEVELS}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card-surface rounded-2xl p-5">
          <s.icon className="h-5 w-5 text-ac-cyan" strokeWidth={1.75} />
          <p className="mt-3 text-xl font-black text-foreground sm:text-2xl">{s.value}</p>
          <p className="mt-1 text-xs text-ac-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
