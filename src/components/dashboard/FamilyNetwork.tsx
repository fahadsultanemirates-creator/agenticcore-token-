import { Bot, Building2, Users2, ArrowUpRight } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";

const FAMILY = [
  {
    icon: Building2,
    name: "AgenticCore Agency",
    body: "AI-run marketing and growth agency.",
  },
  {
    icon: Users2,
    name: "AgenticCore Biz",
    body: "AI-run business services.",
  },
  {
    icon: Bot,
    name: "M&MCore Agency",
    body: "AI-run creative and media agency.",
  },
];

export default function FamilyNetwork() {
  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">The AgenticCore family</h2>
          <p className="mt-1 text-sm text-ac-muted">
            {TOKEN.name} is one of several AI-run businesses in the AgenticCore
            family, with more on the way.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {FAMILY.map((f) => (
          <div key={f.name} className="rounded-xl border border-ac-border bg-ac-bg/60 p-4">
            <f.icon className="h-5 w-5 text-ac-cyan" strokeWidth={1.75} />
            <p className="mt-3 text-sm font-semibold text-foreground">{f.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-ac-muted">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-ac-lime/30 bg-ac-lime/5 p-4">
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-lime" />
        <p className="text-xs leading-relaxed text-foreground/75">
          <strong className="text-ac-lime">On the roadmap:</strong> paying with{" "}
          {TOKEN.ticker} across the AgenticCore family will unlock a discount
          versus paying normally. Not live yet — announced here once it ships.
        </p>
      </div>
    </div>
  );
}
