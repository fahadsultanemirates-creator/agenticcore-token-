import type { Metadata } from "next";
import "./globals.css";
import Web3Provider from "@/components/providers/Web3Provider";
import ReferralCapture from "@/components/providers/ReferralCapture";
import ChatWidget from "@/components/chat/ChatWidget";
import ConnectErrorBanner from "@/components/ui/ConnectErrorBanner";
import { SITE_URL, TOKEN } from "@/lib/tokenConfig";
import { REFERRAL_LEVELS } from "@/lib/referral";

export const metadata: Metadata = {
  title: "AgenticCore (AC) — BEP-20 Token on BNB Smart Chain",
  description: `AgenticCore (AC) is a community-first BEP-20 token on BNB Smart Chain with a $${TOKEN.minBuyUsd}–$${TOKEN.maxBuyUsd} buy range, a ${REFERRAL_LEVELS}-level USDT referral program with a weekly VIP Pool, and a wallet-connect-only dashboard.`,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "AgenticCore (AC)",
    description: `A high-community BEP-20 token on BNB Smart Chain. Fair launch. $${TOKEN.minBuyUsd}–$${TOKEN.maxBuyUsd} buy range per wallet for launch-phase stability.`,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ac-bg text-foreground">
        <Web3Provider>{children}</Web3Provider>
        <ReferralCapture />
        <ChatWidget />
        <ConnectErrorBanner />
      </body>
    </html>
  );
}
