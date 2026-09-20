import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet } from "wagmi/chains";

// WalletConnect Cloud project ID — set as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// in Netlify's env vars. A dedicated project was created for this site
// (2026-09-20) after reusing another site's project ID hit "Invalid App
// Configuration" -- that project was domain-restricted to its own site.
// Falls back to a placeholder so local dev still boots without
// WalletConnect's mobile-QR flow.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AgenticCore (AC)",
  projectId: walletConnectProjectId,
  chains: [bsc, bscTestnet],
  ssr: true,
});
