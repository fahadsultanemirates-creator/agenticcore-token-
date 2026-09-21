import Link from "next/link";
import { Bot, Building2, Users2, ArrowUpRight } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

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
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="The AgenticCore family"
        title="Not a single-product token."
        subtitle={`${TOKEN.name} is one of several AI-run businesses in the AgenticCore family, with 1-2 more sites already on the way.`}
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {FAMILY.map((f) => (
          <div key={f.name} className="card-surface rounded-2xl p-6">
            <f.icon className="h-7 w-7 text-ac-cyan" strokeWidth={1.75} />
            <p className="mt-5 text-base font-bold text-foreground">{f.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-xl border border-ac-lime/30 bg-ac-lime/5 p-5">
        <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-ac-lime" />
        <p className="text-sm leading-relaxed text-foreground/80">
          <strong className="text-ac-lime">On the roadmap:</strong> paying with{" "}
          {TOKEN.ticker} across the AgenticCore family will unlock a{" "}
          <strong className="text-foreground">15% discount</strong> versus paying
          normally. Not live yet — announced here once it ships.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ac-lime hover:underline"
        >
          See what&apos;s next for AgenticCore <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
