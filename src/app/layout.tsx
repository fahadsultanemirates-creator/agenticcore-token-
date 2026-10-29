import type { Metadata, Viewport } from "next";
import "./globals.css";
import Web3Provider from "@/components/providers/Web3Provider";
import ReferralCapture from "@/components/providers/ReferralCapture";
import VisitTracker from "@/components/providers/VisitTracker";
import ServiceWorkerRegistrar from "@/components/providers/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/ui/InstallPrompt";
import ChatWidget from "@/components/chat/ChatWidget";
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
  // Name shown under the icon once installed. Next links the manifest
  // itself automatically from app/manifest.ts.
  applicationName: TOKEN.name,
  // iOS ignores the web app manifest's display mode and reads these meta
  // tags instead, so an iPhone install needs them to open chrome-less.
  appleWebApp: {
    capable: true,
    title: TOKEN.name,
    // "black" keeps the status bar opaque and the page below it. The
    // tempting "black-translucent" renders content *under* the notch, which
    // would need safe-area insets threaded through the sticky navbar -- not
    // worth the regression risk for a cosmetic gain.
    statusBarStyle: "black",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  // Paints the Android status bar and the standalone window's title bar to
  // match the page background, so an installed app has no seam at the top.
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ac-bg text-foreground">
        <Web3Provider>{children}</Web3Provider>
        <ReferralCapture />
        <VisitTracker />
        <ServiceWorkerRegistrar />
        <InstallPrompt />
        <ChatWidget />
      </body>
    </html>
  );
}
