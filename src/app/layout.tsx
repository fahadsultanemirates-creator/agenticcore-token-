import type { Metadata } from "next";
import "./globals.css";
import Web3Provider from "@/components/providers/Web3Provider";
import { SITE_URL } from "@/lib/tokenConfig";

export const metadata: Metadata = {
  title: "AgenticCore (AC) — BEP-20 Token on BNB Smart Chain",
  description:
    "AgenticCore (AC) is a community-first BEP-20 token on BNB Smart Chain with a $100 max-buy stability cap, a 7-level referral program, and a wallet-connect-only dashboard.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "AgenticCore (AC)",
    description:
      "A high-community BEP-20 token on BNB Smart Chain. Fair launch. $100 max buy per wallet for launch-phase stability.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ac-bg text-foreground">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
