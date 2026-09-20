"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import type { ReferralLevelSummary } from "@/lib/mockReferralData";

// Single-series magnitude chart -- referral count per level -- so this uses
// one sequential hue (brand lime) rather than a categorical palette. Level 1
// (Direct) gets full-opacity emphasis; the rest step down slightly so the
// eye still reads "direct" as the anchor without a second hue.
export default function ReferralLevelChart({
  levelSummary,
}: {
  levelSummary: ReferralLevelSummary[];
}) {
  const data = levelSummary.map((l) => ({
    name: l.level === 1 ? "Direct" : `Lvl ${l.level}`,
    referrals: l.referralCount,
    volumeUsd: l.volumeUsd,
    rewardUsdt: l.rewardUsdt,
    pct: l.pct,
  }));

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-ac-lime" />
        <h2 className="text-lg font-bold text-foreground">Referral network by level</h2>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        Referral count per level, with downline volume and your USDT reward on hover.
      </p>

      <div className="mt-5 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }} barCategoryGap={6}>
            <CartesianGrid horizontal={false} stroke="#26232f" strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fill: "#9c96ad", fontSize: 11 }}
              axisLine={{ stroke: "#26232f" }}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={56}
              tick={{ fill: "#f4f2ff", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(124, 58, 237, 0.08)" }}
              contentStyle={{
                background: "#16151d",
                border: "1px solid #26232f",
                borderRadius: 12,
                color: "#f4f2ff",
                fontSize: 13,
              }}
              labelStyle={{ color: "#ccff00", fontWeight: 700, marginBottom: 4 }}
              formatter={(value, name) => {
                if (name === "referrals") return [value, "Referrals"];
                return [value, name];
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-xl border border-ac-border bg-ac-bg-card px-4 py-3 text-xs shadow-xl">
                    <p className="font-bold text-ac-lime">{label}</p>
                    <p className="mt-1.5 text-foreground">{p.referrals} referral{p.referrals === 1 ? "" : "s"}</p>
                    <p className="mt-0.5 text-foreground/70">
                      ${p.volumeUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} downline volume
                    </p>
                    <p className="mt-0.5 text-foreground/70">
                      ${p.rewardUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT reward · {p.pct}%
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="referrals" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={i === 0 ? "#CCFF00" : "rgba(204, 255, 0, 0.55)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
