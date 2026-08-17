"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SectionHeading } from "@/components/marketing/Tokenomics";

const FAQS = [
  {
    q: `Why is there a $${TOKEN.maxBuyUsd} max buy per wallet?`,
    a: `AC is designed as a high-community token — value spread across many holders rather than concentrated in a few large wallets. The $${TOKEN.maxBuyUsd} cap is enforced in the buy contract logic to protect the price from early volatility and whale/bot manipulation while liquidity is still thin. It's a deliberate stability measure, not a limitation on the project's potential.`,
  },
  {
    q: "Is the cap permanent?",
    a: "The cap applies during the launch phase. As liquidity depth and price stability are established, the community will be notified ahead of any adjustment.",
  },
  {
    q: "Do I need to sign up or provide an email to use the dashboard?",
    a: "No. The dashboard is accessed exclusively by connecting a wallet — there is no email, password, or KYC form anywhere in the flow.",
  },
  {
    q: "How does the referral reward structure work?",
    a: "Direct referrals earn 20% of the referred purchase. Each level below decays to 70% of the level above it, continuing through level 7 of your referral tree.",
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
    <section id="faq" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
      <SectionHeading eyebrow="FAQ" title="Common questions" />

      <div className="mt-12 divide-y divide-ac-border card-surface rounded-2xl">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q} className="px-6">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ac-muted transition-transform ${
                    isOpen ? "rotate-180 text-ac-lime" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="pb-5 text-sm leading-relaxed text-ac-muted">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
