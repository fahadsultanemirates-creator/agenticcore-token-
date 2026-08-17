import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet } from "wagmi/chains";

// WalletConnect Cloud project ID — set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
// in the deployment environment. Falls back to a placeholder so local dev
// still boots without WalletConnect's mobile-QR flow.
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "AgenticCore (AC)",
  projectId: walletConnectProjectId,
  chains: [bsc, bscTestnet],
  ssr: true,
});
