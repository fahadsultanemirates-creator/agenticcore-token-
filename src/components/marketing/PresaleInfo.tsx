import { Rocket, Lock, Clock3, ShieldCheck } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

const MILESTONES = [
  {
    icon: Lock,
    title: "Contract audit & deployment",
    status: "In progress",
    body: "The AC BEP-20 contract, including the on-chain $100 max-buy enforcement, is in development and will be audited before launch.",
  },
  {
    icon: Rocket,
    title: "Fair launch on PancakeSwap",
    status: "Upcoming",
    body: "Initial liquidity goes live with the per-wallet cap active from block one — there is no pre-cap window for insiders.",
  },
  {
    icon: Clock3,
    title: "Cap lifts as liquidity matures",
    status: "Planned",
    body: "Once price stability and liquidity depth are established, the community will be notified ahead of any cap adjustment.",
  },
];

export default function PresaleInfo() {
  return (
    <section id="presale" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="Launch"
        title="Built for a fair, stable start."
        subtitle="Here's what to expect as AgenticCore moves toward launch."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {MILESTONES.map((m) => (
          <div key={m.title} className="card-surface rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <m.icon className="h-7 w-7 text-ac-cyan" strokeWidth={1.75} />
              <span className="rounded-full border border-ac-border px-2.5 py-1 text-[11px] font-semibold text-ac-muted">
                {m.status}
              </span>
            </div>
            <h3 className="mt-5 text-base font-bold text-foreground">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ac-muted">{m.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-ac-border bg-ac-bg-elevated p-6">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ac-lime" />
        <p className="text-sm text-ac-muted">
          <strong className="text-foreground">Contract address will be published here and on official channels only.</strong>{" "}
          Until {TOKEN.ticker} is live, any token claiming to be AgenticCore
          elsewhere is not affiliated with this project.
        </p>
      </div>
    </section>
  );
}
