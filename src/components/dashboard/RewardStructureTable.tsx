import { formatPct, getTotalReferralPct, REFERRAL_LEVELS } from "@/lib/referral";
import type { ReferralLevelSummary } from "@/lib/mockReferralData";

export default function RewardStructureTable({
  levelSummary,
}: {
  levelSummary: ReferralLevelSummary[];
}) {
  return (
    <div className="card-surface rounded-2xl p-6">
      <h2 className="text-lg font-bold text-foreground">Referral reward structure</h2>
      <p className="mt-1 text-sm text-ac-muted">
        Direct referrals earn 20% of the purchase, paid in USDT. Levels 2
        through {REFERRAL_LEVELS} split the rest, for up to{" "}
        {formatPct(getTotalReferralPct())} of a referred purchase across the
        whole tree.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ac-border text-left text-xs uppercase tracking-wider text-ac-muted">
              <th className="pb-3 pr-4 font-semibold">Level</th>
              <th className="pb-3 pr-4 font-semibold">Reward %</th>
              <th className="pb-3 pr-4 font-semibold">Referrals</th>
              <th className="pb-3 pr-4 font-semibold">Downline Volume</th>
              <th className="pb-3 font-semibold">Est. Reward</th>
            </tr>
          </thead>
          <tbody>
            {levelSummary.map((row) => (
              <tr key={row.level} className="border-b border-ac-border/60 last:border-0">
                <td className="py-3.5 pr-4 font-medium text-foreground">
                  {row.level === 1 ? "Direct" : `Level ${row.level}`}
                </td>
                <td className="py-3.5 pr-4">
                  <span
                    className={
                      row.level === 1
                        ? "font-bold text-ac-lime"
                        : "font-semibold text-foreground"
                    }
                  >
                    {formatPct(row.pct)}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-ac-muted">{row.referralCount}</td>
                <td className="py-3.5 pr-4 text-ac-muted">
                  ${row.volumeUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 font-medium text-foreground">
                  ${row.rewardUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
