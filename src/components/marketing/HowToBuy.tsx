import { Wallet, ArrowLeftRight, ShoppingCart, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { TOKEN, REFERRED_BUY_BONUS_PCT } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

const STEPS = [
  {
    icon: Wallet,
    title: "Connect your wallet",
    body: "Use MetaMask, Trust Wallet, or any BNB Smart Chain wallet. No account, email, or KYC form required.",
  },
  {
    icon: ArrowLeftRight,
    title: "Bridge to BNB Smart Chain",
    body: "Fund your wallet with BNB. Most exchanges support BSC withdrawals directly.",
  },
  {
    icon: ShoppingCart,
    title: `Buy $${TOKEN.minBuyUsd}–$${TOKEN.maxBuyUsd} in AC`,
    body: `Swap BNB for ${TOKEN.ticker}. The buy flow automatically enforces the $${TOKEN.minBuyUsd} minimum and $${TOKEN.maxBuyUsd} per-wallet cap — no manual math needed. Buying through a referral link mints ${REFERRED_BUY_BONUS_PCT}% more ${TOKEN.ticker} than a direct, no-referral buy.`,
  },
];

export default function HowToBuy() {
  return (
    <section id="how-to-buy" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeading
        eyebrow="How to Buy"
        title="Three steps. No sign-up."
        subtitle="Buying AC only ever requires a wallet connection — never an email, password, or KYC document."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="card-surface relative rounded-2xl p-6">
            <span className="absolute right-6 top-6 text-4xl font-black text-ac-border">
              0{i + 1}
            </span>
            <step.icon className="h-8 w-8 text-ac-lime" strokeWidth={1.75} />
            <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{step.body}</p>
          </div>
        ))}
      </div>

      <CapExplainer />

      <div className="mt-10 flex justify-center">
        <div className="card-surface flex flex-col items-center gap-3 rounded-2xl px-8 py-6 text-center">
          <p className="text-sm text-foreground/70">
            The {TOKEN.ticker} contract is not deployed yet — the buy button
            below will activate automatically once it goes live. Buys will
            run ${TOKEN.minBuyUsd}&ndash;${TOKEN.maxBuyUsd} per wallet.
          </p>
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-ac-border px-7 py-3 text-sm font-bold text-ac-muted"
          >
            Buy {TOKEN.ticker} — coming soon
          </button>
        </div>
      </div>
    </section>
  );
}

function CapExplainer() {
  return (
    <div className="relative mt-16 overflow-hidden rounded-3xl border border-ac-violet/30 bg-gradient-to-br from-ac-violet/15 via-ac-bg-card to-ac-bg-card p-8 sm:p-10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-ac-violet/25 blur-[100px]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex items-center gap-3 lg:w-72 lg:shrink-0">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ac-lime/15">
            <ShieldCheck className="h-7 w-7 text-ac-lime" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ac-lime">
              Not a limitation — a safeguard
            </p>
            <h3 className="mt-1 text-2xl font-black text-foreground">
              Why a ${TOKEN.minBuyUsd}&ndash;${TOKEN.maxBuyUsd} buy range?
            </h3>
          </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-foreground/75 sm:text-base">
          <p>
            AgenticCore is a <strong className="text-ac-lime">high-community token</strong> —
            its value is meant to be distributed across thousands of early
            holders, not concentrated in a handful of large buys during the
            first volatile hours of trading.
          </p>
          <p>
            A <strong className="text-ac-lime">${TOKEN.minBuyUsd} minimum</strong> keeps the
            launch a genuine community event rather than dust transactions,
            and a <strong className="text-ac-lime">${TOKEN.maxBuyUsd} maximum</strong> per
            wallet is enforced directly in the buy contract logic. The cap
            exists to prevent any single wallet from destabilizing the price
            while liquidity is still thin and the market hasn&apos;t found
            its footing — the exact window where whale buys and bots do the
            most damage to a fair launch.
          </p>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <div className="flex items-start gap-2.5 rounded-xl border border-ac-border/80 bg-ac-bg/60 p-4">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
              <p className="text-xs text-foreground/75 sm:text-sm">
                <strong className="text-foreground">Protects price stability</strong> during
                the uncertain early-launch phase, before liquidity depth is
                established.
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-ac-border/80 bg-ac-bg/60 p-4">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
              <p className="text-xs text-foreground/75 sm:text-sm">
                <strong className="text-foreground">Widens distribution</strong> so AC
                launches in the hands of a real community, not a few
                concentrated wallets.
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/50">
            The ${TOKEN.minBuyUsd}&ndash;${TOKEN.maxBuyUsd} range applies per
            wallet at launch and is enforced on-chain in the buy contract —
            it is not a manual or discretionary limit.
          </p>
        </div>
      </div>
    </div>
  );
}
