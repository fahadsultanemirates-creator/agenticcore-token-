import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { TOKEN, formatSupply } from "@/lib/tokenConfig";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-ac-violet/30 blur-[140px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-ac-violet/40 bg-ac-violet/10 px-4 py-1.5 text-xs font-medium text-violet-200">
            <Sparkles className="h-3.5 w-3.5 text-ac-lime" />
            Fair launch on BNB Smart Chain
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-gradient sm:text-6xl">
            The community-owned token built to launch stable.
          </h1>

          <p className="mt-6 max-w-xl text-balance text-base text-ac-muted sm:text-lg">
            AgenticCore ({TOKEN.ticker}) is a {TOKEN.standard} token on{" "}
            {TOKEN.chain} with a {formatSupply(TOKEN.totalSupply)} fixed
            supply, a 7-level referral program, and a $
            {TOKEN.maxBuyUsd} per-wallet buy cap engineered to protect the
            launch from volatility.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#how-to-buy"
              className="group inline-flex items-center gap-2 rounded-full bg-ac-lime px-7 py-3 text-sm font-bold text-black transition hover:brightness-95 active:scale-[0.98]"
            >
              Buy {TOKEN.ticker}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-ac-border bg-ac-bg-elevated px-7 py-3 text-sm font-semibold text-foreground transition hover:border-ac-violet/50"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-xs text-ac-muted">
            <ShieldCheck className="h-4 w-4 text-ac-cyan" />
            Contract not yet deployed — presale details below.
          </div>
        </div>

        <HeroStats />
      </div>
    </section>
  );
}

function HeroStats() {
  const stats = [
    { label: "Total Supply", value: `${formatSupply(TOKEN.totalSupply)} AC` },
    { label: "Max Buy / Wallet", value: `$${TOKEN.maxBuyUsd}` },
    { label: "Network", value: "BNB Smart Chain" },
    { label: "Referral Depth", value: "7 Levels" },
  ];

  return (
    <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="card-surface rounded-2xl px-4 py-5 text-center"
        >
          <p className="text-xl font-bold text-foreground sm:text-2xl">{s.value}</p>
          <p className="mt-1 text-xs text-ac-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
