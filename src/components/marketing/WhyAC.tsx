import { Cpu, Zap, Building2 } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

const POINTS = [
  {
    icon: Zap,
    title: "Useful from day one",
    body: "Most tokens launch as pure speculation, with no real product for months or years. AC ships with a working wallet-connect dashboard, a live 10-level USDT referral engine, and a weekly VIP Pool — functioning the moment you connect a wallet.",
  },
  {
    icon: Cpu,
    title: "Built AI-first",
    body: "AC is designed from the ground up as an AI-oriented utility token, not a speculative afterthought. More AI-specific capabilities are on the roadmap and will be announced as they ship.",
  },
  {
    icon: Building2,
    title: "A growing family of AI-run businesses",
    body: `${TOKEN.name} is part of a wider AgenticCore family of AI-run companies. On the roadmap: paying with ${TOKEN.ticker} across the family unlocks a discount versus paying normally.`,
  },
];

export default function WhyAC() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="Why AC"
        title="An AI-native utility token, not another speculative launch."
        subtitle="Real utility, live from the first connected wallet — with more built as the AgenticCore family grows."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.title} className="card-surface rounded-2xl p-6">
            <p.icon className="h-7 w-7 text-ac-lime" strokeWidth={1.75} />
            <h3 className="mt-5 text-base font-bold text-foreground">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
