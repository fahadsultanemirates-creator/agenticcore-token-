import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet } from "wagmi/chains";

// WalletConnect Cloud project ID — set as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// in Netlify's env vars. Recreated 2026-09-20 after the first dedicated
// project (created same day) never completed a session handshake at all --
// no QR, no wallet-app deep link, on any device or browser. Falls back to
// a placeholder so local dev still boots without WalletConnect's mobile-QR
// flow.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AgenticCore (AC)",
  projectId: walletConnectProjectId,
  chains: [bsc, bscTestnet],
  ssr: true,
});
