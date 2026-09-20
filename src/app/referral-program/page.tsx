import Link from "next/link";
import { ArrowRight, Users, ShieldCheck, Crown, Wallet, Building2 } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { VIP_POOL, REFERRED_BUY_BONUS_PCT } from "@/lib/tokenConfig";
import { getReferralLevelRates, getTotalReferralPct, formatPct, REFERRAL_LEVELS } from "@/lib/referral";

export const metadata: Metadata = {
  title: "Referral Program & VIP Pool — AgenticCore (AC)",
  description: `How AgenticCore's ${REFERRAL_LEVELS}-level USDT referral program and weekly VIP Pool work.`,
};

export default function ReferralProgramPage() {
  const rates = getReferralLevelRates();
  const totalPct = getTotalReferralPct();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-grid">
          <div
            className="pointer-events-none absolute left-1/2 top-[-10%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-ac-violet/25 blur-[140px]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
            <span className="text-xs font-bold uppercase tracking-widest text-ac-lime">
              Referral Program &amp; VIP Pool
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gradient sm:text-5xl">
              {REFERRAL_LEVELS} levels deep. Paid in USDT. No token dilution.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-foreground/75 sm:text-lg">
              Every AC purchase made through a referral link pays real USDT
              commissions across up to {REFERRAL_LEVELS} levels of the tree
              above the buyer, plus feeds a weekly VIP Pool — all funded from
              live transaction flow, never from a pre-minted token bucket.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">The {REFERRAL_LEVELS}-level payout table</h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground/70">
            Direct referrals pay 20% of the purchase. The remaining {REFERRAL_LEVELS - 1} levels
            split the rest — up to {formatPct(totalPct)} of a referred purchase&apos;s USDT value
            paid out across the whole tree.
          </p>

          <div className="mt-8 card-surface overflow-hidden rounded-2xl">
            <div className="grid grid-cols-5 gap-px bg-ac-border sm:grid-cols-10">
              {rates.map((r) => (
                <div key={r.level} className="flex flex-col items-center gap-1 bg-ac-bg-card px-2 py-6">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                    {r.level === 1 ? "Direct" : `Lvl ${r.level}`}
                  </span>
                  <span className={`text-lg font-black sm:text-xl ${r.level === 1 ? "text-ac-lime" : "text-foreground"}`}>
                    {formatPct(r.pct)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">Referred vs. direct — what actually happens</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="card-surface relative overflow-hidden rounded-2xl border-ac-lime/25 p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ac-lime/15">
                  <Users className="h-5 w-5 text-ac-lime" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Bought through a referral link</h3>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-foreground/75">
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-lime" />
                  Up to {formatPct(totalPct)} of the purchase splits as USDT commissions across the {REFERRAL_LEVELS} levels above the buyer.
                </li>
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-lime" />
                  {VIP_POOL.poolCutPct}% of the purchase feeds the weekly VIP Pool.
                </li>
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-lime" />
                  The buyer mints {REFERRED_BUY_BONUS_PCT}% more AC than a direct buy of the same USD amount.
                </li>
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-lime" />
                  The remainder goes to the AgenticCore treasury wallet.
                </li>
              </ul>
            </div>

            <div className="card-surface relative overflow-hidden rounded-2xl p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ac-violet/15">
                  <Building2 className="h-5 w-5 text-ac-violet-light" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Bought with no referral link</h3>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-foreground/75">
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
                  100% of the purchase goes straight to the AgenticCore treasury wallet.
                </li>
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
                  No referral commissions are paid out — there&apos;s no one to pay.
                </li>
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
                  No VIP Pool contribution.
                </li>
                <li className="flex gap-2.5">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
                  The buyer mints the standard AC amount for their USD spend.
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-5 text-xs text-foreground/50">
            All referral commissions and VIP Pool payouts settle in USDT — never in AC. AC itself is only ever minted for a genuine token purchase.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-ac-lime/25 bg-gradient-to-br from-ac-lime/10 via-ac-bg-card to-ac-bg-card p-8 sm:p-10">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-ac-lime/20 blur-[110px]"
              aria-hidden
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="flex items-center gap-3 lg:w-72 lg:shrink-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ac-lime/15">
                  <Crown className="h-7 w-7 text-ac-lime" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-ac-lime">Weekly · USDT</p>
                  <h2 className="mt-1 text-2xl font-black text-foreground">The VIP Pool</h2>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-foreground/75 sm:text-base">
                <p>
                  <strong className="text-ac-lime">{VIP_POOL.poolCutPct}% of every referred purchase&apos;s USDT value</strong>{" "}
                  is swept into a shared pool automatically. Every Sunday at{" "}
                  <strong className="text-foreground">5pm GMT</strong>, that week&apos;s pool is paid
                  out in USDT to everyone who qualifies.
                </p>
                <p>
                  You qualify the moment your own{" "}
                  <strong className="text-foreground">direct (not indirect) referral sales</strong>, or
                  your own <strong className="text-foreground">personal buy volume</strong>, reaches{" "}
                  <strong className="text-ac-lime">${VIP_POOL.qualifyUsd.toLocaleString()}</strong>.
                  Qualification is permanent — once you&apos;re in, you keep getting paid every week
                  the pool runs, with no need to hit the threshold again.
                </p>
                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-ac-border/80 bg-ac-bg/60 p-4">
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
                    <p className="text-xs text-foreground/75 sm:text-sm">
                      <strong className="text-foreground">Paid in USDT</strong>, split evenly across
                      that week&apos;s qualified members.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl border border-ac-border/80 bg-ac-bg/60 p-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ac-cyan" />
                    <p className="text-xs text-foreground/75 sm:text-sm">
                      <strong className="text-foreground">Funded live</strong>, not from a pre-minted
                      allocation — the pool only exists because referred purchases are happening.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-20 text-center sm:px-8">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">See your own numbers</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/70">
            Connect your wallet to get your referral link, watch your VIP Pool progress, and track
            every level of your tree in real time.
          </p>
          <Link
            href="/dashboard"
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ac-lime px-7 py-3 text-sm font-bold text-black transition hover:brightness-95 active:scale-[0.98]"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
