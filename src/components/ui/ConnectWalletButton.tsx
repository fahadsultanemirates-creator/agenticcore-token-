"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, ChevronDown, AlertTriangle } from "lucide-react";

export default function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="group inline-flex items-center gap-2 rounded-full bg-ac-lime px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-95 active:scale-[0.98]"
                  >
                    <Wallet className="h-4 w-4" strokeWidth={2.5} />
                    {compact ? "Connect" : "Connect Wallet"}
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-ac-border bg-ac-bg-elevated px-3 py-2 text-xs font-medium text-ac-muted transition hover:text-foreground"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={chain.name ?? "chain"} src={chain.iconUrl} className="h-3.5 w-3.5 rounded-full" />
                    )}
                    {chain.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-ac-violet/40 bg-ac-violet/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-ac-violet/20"
                  >
                    <span className="h-2 w-2 rounded-full bg-ac-lime animate-pulse-slow" />
                    {account.displayName}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
