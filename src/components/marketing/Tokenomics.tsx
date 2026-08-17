"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TOKEN, TOKENOMICS, formatSupply } from "@/lib/tokenConfig";

export default function Tokenomics() {
  return (
    <section id="tokenomics" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="Tokenomics"
        title="A fixed, transparent supply."
        subtitle={`${formatSupply(TOKEN.totalSupply)} ${TOKEN.ticker} minted at genesis. No inflation, no hidden mint function.`}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TOKENOMICS as unknown as Record<string, unknown>[]}
                dataKey="pct"
                nameKey="label"
                innerRadius="66%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {TOKENOMICS.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#16151d",
                  border: "1px solid #26232f",
                  borderRadius: 12,
                  color: "#f4f2ff",
                  fontSize: 13,
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-foreground">
              {formatSupply(TOKEN.totalSupply)}
            </span>
            <span className="text-xs text-ac-muted">Total {TOKEN.ticker} Supply</span>
          </div>
        </div>

        <ul className="space-y-3">
          {TOKENOMICS.map((item) => (
            <li
              key={item.label}
              className="card-surface flex items-center justify-between rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-ac-muted">{item.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-bold uppercase tracking-widest text-ac-lime">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-ac-muted">{subtitle}</p>}
    </div>
  );
}
