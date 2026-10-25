import { Rocket, Lock, Clock3, ShieldCheck } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

const MILESTONES = [
  {
    icon: Lock,
    title: "Contract deployed & live",
    status: "Live",
    body: `The AC BEP-20 contract is deployed on ${TOKEN.chain}, enforcing the on-chain $${TOKEN.minBuyUsd}–$${TOKEN.maxBuyUsd} buy range and referral/VIP Pool payout logic in production.`,
  },
  {
    icon: Rocket,
    title: "Fair launch on PancakeSwap",
    status: "Upcoming",
    body: "Initial liquidity goes live with the per-wallet range active from block one — there is no pre-cap window for insiders.",
  },
  {
    icon: Clock3,
    title: "Range widens as liquidity matures",
    status: "Planned",
    body: "Once price stability and liquidity depth are established, the community will be notified ahead of any buy-range adjustment.",
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
              <span className="rounded-full border border-ac-lime/40 px-2.5 py-1 text-[11px] font-semibold text-ac-lime">
                {m.status}
              </span>
            </div>
            <h3 className="mt-5 text-base font-bold text-foreground">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{m.body}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-ac-border bg-ac-bg-elevated p-6">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ac-lime/6 blur-[80px]"
          aria-hidden
        />
        <div className="relative flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ac-lime" />
          <p className="text-sm text-foreground/75">
            <strong className="text-ac-lime">
              Verified contract:{" "}
              <a
                href={`${TOKEN.bscScanBase}/address/${TOKEN.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ac-lime/50 underline-offset-2 hover:decoration-ac-lime"
              >
                {TOKEN.contractAddress}
              </a>
            </strong>{" "}
            Always confirm against this address or official channels — any token
            claiming to be AgenticCore elsewhere is not affiliated with this project.
          </p>
        </div>
      </div>
    </section>
  );
}
