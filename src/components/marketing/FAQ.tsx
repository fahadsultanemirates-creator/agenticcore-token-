"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TOKEN, VIP_POOL, REFERRED_BUY_BONUS_PCT } from "@/lib/tokenConfig";
import { REFERRAL_LEVELS, getTotalReferralPct, formatPct } from "@/lib/referral";
import { SectionHeading } from "@/components/marketing/Tokenomics";

const FAQS = [
  {
    q: `Why a $${TOKEN.minBuyUsd}–$${TOKEN.maxBuyUsd} buy range per wallet?`,
    a: `AC is designed as a high-community token — value spread across many holders rather than concentrated in a few large wallets. The $${TOKEN.minBuyUsd} minimum keeps the launch a genuine community event, and the $${TOKEN.maxBuyUsd} maximum is enforced in the buy contract logic to protect the price from early volatility and whale/bot manipulation while liquidity is still thin. It's a deliberate stability measure, not a limitation on the project's potential.`,
  },
  {
    q: "Is the buy range permanent?",
    a: "The range applies during the launch phase. As liquidity depth and price stability are established, the community will be notified ahead of any adjustment.",
  },
  {
    q: "Do I need to sign up or provide an email to use the dashboard?",
    a: "No. Connecting a wallet is the account — there is no email, password, or KYC form anywhere in the flow.",
  },
  {
    q: "How does the referral reward structure work?",
    a: `Every purchase made through a referral link pays out in USDT (never AC) across up to ${REFERRAL_LEVELS} levels of the referring tree — direct referrals earn 20%, decreasing through the levels below, for up to ${formatPct(getTotalReferralPct())} of the purchase total. A referred buy also mints the buyer ${REFERRED_BUY_BONUS_PCT}% more AC than a direct, no-referral buy. Buying with no referral link sends 100% of the purchase to the AgenticCore treasury instead — no commissions paid out.`,
  },
  {
    q: "What is the VIP Pool?",
    a: `${VIP_POOL.poolCutPct}% of every referred purchase's USDT value is swept into a weekly pool, paid out in USDT every Sunday at 5pm GMT. Anyone whose own direct referral sales, or their own personal buy volume, reaches $${VIP_POOL.qualifyUsd} qualifies — and stays qualified for as long as the referral program runs, with no need to re-qualify each week.`,
  },
  {
    q: "What chain is AC on?",
    a: `AgenticCore is a ${TOKEN.standard} token on ${TOKEN.chain}, compatible with any BSC wallet such as MetaMask or Trust Wallet.`,
  },
  {
    q: "Has the contract been deployed yet?",
    a: "Not yet — smart contract development and audit are underway. This site is the frontend, ready to connect to the contract address once it's live.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative mx-auto max-w-4xl overflow-hidden px-5 py-24 sm:px-8">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-ac-cyan/10 blur-[130px]"
        aria-hidden
      />
      <div className="relative">
      <SectionHeading eyebrow="FAQ" title="Common questions" />

      <div className="mt-12 divide-y divide-ac-border card-surface rounded-2xl">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          const isHighlighted = i >= FAQS.length - 4;
          return (
            <div key={item.q} className="px-6">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span
                  className={`text-sm font-semibold sm:text-base ${
                    isHighlighted ? "text-ac-lime" : "text-foreground"
                  }`}
                >
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ac-muted transition-transform ${
                    isOpen ? "rotate-180 text-ac-lime" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="pb-5 text-sm leading-relaxed text-foreground/75">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
