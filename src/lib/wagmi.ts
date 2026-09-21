import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  trustWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { bsc, bscTestnet } from "wagmi/chains";

// WalletConnect Cloud project ID — set as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// in Netlify's env vars. Back on the original project (2026-09-20) with
// agenticcore-token.netlify.app now added to its Domain allowlist -- that
// allowlist was empty, which blocks every domain by default, not the
// reverse; the two freshly-created replacement projects hit the same wall
// since a brand-new project's allowlist starts empty too. Falls back to a
// placeholder so local dev still boots without WalletConnect's mobile-QR
// flow.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AgenticCore (AC)",
  appDescription: "AgenticCore (AC) — BEP-20 token on BNB Smart Chain.",
  // WalletConnect session metadata with no icon is a known trigger for
  // some wallets to silently drop the pairing request instead of
  // completing it -- always send at least one. Guarded for the build's
  // Node-side prerender pass, where `window` doesn't exist.
  appIcon: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : undefined,
  projectId: walletConnectProjectId,
  chains: [bsc, bscTestnet],
  ssr: true,
  // Explicit wallet list so MetaMask, Trust Wallet, and Coinbase Wallet each
  // get their own first-class tile in the connect modal, using the browser
  // extension's direct injected connection when one is installed (the path
  // that's actually been working) rather than every wallet besides MetaMask
  // getting funneled into a single generic "WalletConnect" tile -- that
  // tile's QR/relay flow is the one that's been unreliable. WalletConnect
  // itself is kept as a separate fallback option for wallets not listed
  // individually, or for pairing with a phone that has no extension.
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, trustWallet, coinbaseWallet, injectedWallet],
    },
    {
      groupName: "Other",
      wallets: [walletConnectWallet],
    },
  ],
});
