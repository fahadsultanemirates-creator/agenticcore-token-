"use client";

import { Wallet, ShieldCheck, Network, Link2 } from "lucide-react";
import ConnectWalletButton from "@/components/ui/ConnectWalletButton";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "No sign-up, ever",
    body: "No email, no password, no KYC form. Your wallet is your identity.",
  },
  {
    icon: Link2,
    title: "Instant referral link",
    body: "Connecting generates your unique referral link immediately.",
  },
  {
    icon: Network,
    title: "Full 7-level tree",
    body: "See every referral in your downline and the rewards they generate.",
  },
];

export default function ConnectGate() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-grid px-5 py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ac-violet/25 blur-[130px]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ac-violet/15">
          <Wallet className="h-8 w-8 text-ac-violet-light" strokeWidth={1.75} />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Connect your wallet to open your dashboard
        </h1>
        <p className="mt-4 text-base text-ac-muted">
          The AgenticCore dashboard is accessed exclusively through a wallet
          connection — there is no other way in, and no other way out.
        </p>

        <div className="mt-8">
          <ConnectWalletButton />
        </div>

        <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="card-surface rounded-xl p-5 text-left">
              <p.icon className="h-5 w-5 text-ac-lime" strokeWidth={1.75} />
              <h3 className="mt-3 text-sm font-bold text-foreground">{p.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ac-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
