"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { useState } from "react";

// Custom event name used to surface a wallet-connect failure outside of
// DevTools -- see ConnectErrorBanner.tsx, which renders whatever this fires.
export const WALLET_MUTATION_ERROR_EVENT = "wallet-mutation-error";

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            // wagmi's useConnect (used internally by RainbowKit's connect
            // modal) stores a failed connection attempt in the mutation's
            // own error state instead of throwing it -- react-query's
            // MutationCache is the one place that sees every mutation
            // failure in the app regardless of who triggered it, so this is
            // how a silent connect failure actually becomes visible.
            console.error("[wallet mutation error]", error);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent(WALLET_MUTATION_ERROR_EVENT, { detail: error }));
            }
          },
        }),
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7C3AED",
            accentColorForeground: "#0A0A0F",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
