import { Bot, Building2, Users2, ArrowUpRight, Network, ShieldCheck, Store, type LucideIcon } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { SectionHeading } from "@/components/marketing/Tokenomics";
import { TOKEN } from "@/lib/tokenConfig";

const FAMILY = [
  { icon: Building2, name: "AgenticCore Agency", body: "AI-run marketing and growth agency." },
  { icon: Users2, name: "AgenticCore Biz", body: "AI-run business services." },
  { icon: Bot, name: "M&MCore Agency", body: "AI-run creative and media agency." },
];

interface Phase {
  icon: LucideIcon;
  phase: string;
  title: string;
  focus: string;
  points: string[];
}

const PHASES: Phase[] = [
  {
    icon: Bot,
    phase: "Phase 1",
    title: "Autonomous agent infrastructure & API settlement",
    focus: "Ground-floor utility and transaction volume.",
    points: [
      "AI agents holding their own wallets and paying for services independently",
      "On-chain micro-billing so API calls and agent compute settle in AC",
      "Non-custodial escrow for machine-to-machine service delivery",
    ],
  },
  {
    icon: ShieldCheck,
    phase: "Phase 2",
    title: "Verifiable AI inference & cryptographic attestation",
    focus: "Trust and security for off-chain AI models.",
    points: [
      "Cryptographic verification (zkML) that an off-chain model ran as claimed",
      "Trusted-hardware attestation as a lighter-weight alternative for heavier models",
      "Model checkpoints and datasets anchored on-chain via IPFS/Arweave",
    ],
  },
  {
    icon: Store,
    phase: "Phase 3",
    title: "Agent marketplace & staking-for-compute",
    focus: "Token sinks and network effects.",
    points: [
      "A marketplace where developers publish and monetize AI agents through AC revenue-share",
      "Node and GPU operators staking AC as collateral to host agent workloads",
      "A burn-and-mint mechanism so network fees create ongoing deflationary pressure",
    ],
  },
  {
    icon: Network,
    phase: "Phase 4",
    title: "Agent-to-agent coordination & governance",
    focus: "Fully autonomous scaling and shared governance.",
    points: [
      "AI agents and token holders co-participating in protocol parameter decisions",
      "Multi-agent swarms negotiating and executing multi-step workflows on-chain",
      "Rewards for contributing datasets or compute to ongoing model fine-tuning",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <SectionHeading
            eyebrow="Ecosystem & Roadmap"
            title="Live today, and where AC is headed."
            subtitle={`What ${TOKEN.ticker} already does across the AgenticCore family, and the direction the protocol is being built toward.`}
          />
        </section>

        <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ac-lime">Live today</h2>
          <p className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            The AgenticCore family of AI-run businesses.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-foreground/70">
            {TOKEN.name} is one of several AI-run businesses under the AgenticCore
            name, with 1-2 more sites already on the way.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
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
              <strong className="text-foreground">15% discount</strong> versus
              paying normally. Not live yet — announced here once it ships.
            </p>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-24 sm:px-8">
          <div
            className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-ac-violet/15 blur-[120px]"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ac-lime">What&apos;s next</h2>
            <p className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              A long-term direction, not a delivery promise.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-foreground/70">
              These four phases describe the vision for where AC-powered
              infrastructure is headed for autonomous AI agents. This is
              exploratory, multi-year direction — not audited, not built, and
              not a guarantee of any specific delivery date.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {PHASES.map((p) => (
                <div key={p.phase} className="card-surface rounded-2xl p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ac-violet/15">
                      <p.icon className="h-5 w-5 text-ac-lime" strokeWidth={1.75} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-ac-cyan">
                        {p.phase}
                      </span>
                      <h3 className="text-base font-bold text-foreground">{p.title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ac-muted">
                    {p.focus}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {p.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ac-lime" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
