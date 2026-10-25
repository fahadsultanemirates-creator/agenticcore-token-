import Link from "next/link";
import { Zap, Building2, Users2, ArrowUpRight } from "lucide-react";
import { TOKEN, SERVICE_TOKEN_PAYMENT_DISCOUNT_PCT } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

// Each sibling site keeps its own brand color here on purpose -- this is
// the one place the gold re-theme doesn't apply, since these icons
// represent those sites' own identity, not this one's.
const FAMILY = [
  { icon: Building2, domain: "agenticcore.group", color: "#F97316", body: "Managed digital offices, departments and custom office frameworks." },
  {
    icon: Building2,
    domain: "agenticcore.agency",
    color: "#22D3EE",
    body: "Websites, applications, brand identity and design.",
  },
  {
    icon: Users2,
    domain: "agenticcore.biz",
    color: "#F97316",
    body: "Business plans, research, documents and setup.",
  },
  {
    icon: Zap,
    domain: "agenticcore.click",
    color: "#FACC15",
    body: "Quick, affordable digital tasks.",
  },
];

export default function FamilyNetwork() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="The AgenticCore family"
        title="Not a single-product token."
        subtitle={`${TOKEN.name} is one of several AI-run businesses in the AgenticCore family. Pay with AC for managed offices, website projects, business setup and quick digital tasks — live now across all four family sites.`}
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FAMILY.map((f) => (
          <a key={f.domain} href={`https://${f.domain}`} className="card-surface block rounded-2xl p-6 transition hover:ring-1 hover:ring-ac-lime">
            <f.icon className="h-7 w-7" strokeWidth={1.75} style={{ color: f.color }} />
            <p className="mt-5 text-base font-bold text-foreground">{f.domain}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.body}</p>
          </a>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-xl border border-ac-lime/30 bg-ac-lime/5 p-5">
        <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-ac-lime" />
        <p className="text-sm leading-relaxed text-foreground/80">
          <strong className="text-ac-lime">Already live:</strong> paying with{" "}
          {TOKEN.ticker} across the AgenticCore family unlocks a{" "}
          <strong className="text-foreground">{SERVICE_TOKEN_PAYMENT_DISCOUNT_PCT}% discount</strong> on
          eligible service invoices. Network, conversion quote and eligibility terms are shown before payment.
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
