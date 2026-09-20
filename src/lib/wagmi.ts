import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet } from "wagmi/chains";

// WalletConnect Cloud project ID — set as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// in Netlify's env vars (set 2026-09-20). Falls back to a placeholder so
// local dev still boots without WalletConnect's mobile-QR flow -- the
// placeholder is invalid and Reown's servers reject it with "Invalid App
// Configuration" the moment a wallet app tries to open a session with it.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AgenticCore (AC)",
  projectId: walletConnectProjectId,
  chains: [bsc, bscTestnet],
  ssr: true,
});
