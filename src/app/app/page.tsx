"use client";

import Image from "next/image";
import Link from "next/link";
import { formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { ArrowRight, ExternalLink, Users, Map as MapIcon } from "lucide-react";
import ConnectWalletButton from "@/components/ui/ConnectWalletButton";
import { ERC20_ABI, SALE_ABI } from "@/lib/contracts";
import { TOKEN } from "@/lib/tokenConfig";

/**
 * The installed app's home screen -- what the PWA and any future APK open
 * to, set as the manifest's start_url.
 *
 * Deliberately not the marketing page. "/" exists to convince a stranger to
 * buy; by the time someone has installed the app they are already a holder,
 * and the long landing page is just distance between them and their
 * dashboard. So this is a single screen: who they are, what they hold, and
 * one big button through to the real thing.
 *
 * It renders no Navbar and no Footer. Those carry marketing navigation that
 * has no place in an app shell, and in standalone display mode there is no
 * browser chrome above them to make the layout read correctly anyway.
 */
export default function AppHomePage() {
  const { address, isConnected } = useAccount();

  // Two cheap reads, batched: AC held, and USD put in through the sale.
  // Everything else a holder might want -- referral tree, VIP pool, reward
  // history -- lives one tap away in the dashboard and is not worth the
  // round trips on an app-open.
  const { data: reads, isLoading } = useReadContracts({
    contracts: address
      ? [
          {
            address: TOKEN.contractAddress,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: TOKEN.presaleContractAddress,
            abi: SALE_ABI,
            functionName: "totalPurchasedUsd",
            args: [address],
          },
        ]
      : undefined,
    query: { enabled: !!address },
  });

  const acBalanceRaw = reads?.[0]?.result as bigint | undefined;
  const investedUsdRaw = reads?.[1]?.result as bigint | undefined;

  const acBalance =
    acBalanceRaw !== undefined
      ? Number(formatUnits(acBalanceRaw, TOKEN.decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })
      : null;

  // totalPurchasedUsd is already whole dollars on-chain, not scaled.
  const investedUsd = investedUsdRaw !== undefined ? Number(investedUsdRaw) : null;

  return (
    // Content flows top-down and the page ends where the content ends. An
    // earlier version stretched to min-h-dvh and pushed the link tiles to
    // the bottom with mt-auto, which on a tall phone left a large dead gap
    // mid-screen. pb-28 keeps the last tile clear of the floating Maya
    // button, which is fixed at bottom-5.
    <main className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={36} height={36} priority className="rounded-lg" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-foreground">{TOKEN.name}</p>
            <p className="text-xs text-ac-muted">${TOKEN.ticker}</p>
          </div>
        </div>
        <ConnectWalletButton compact />
      </header>

      <section className="mt-10">
        {isConnected ? (
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={`Your ${TOKEN.ticker}`}
              value={isLoading && acBalance === null ? "—" : (acBalance ?? "0")}
            />
            <Stat
              label="Invested"
              value={
                isLoading && investedUsd === null
                  ? "—"
                  : `$${(investedUsd ?? 0).toLocaleString()}`
              }
            />
          </div>
        ) : (
          // Nothing on this screen is meaningful without an address, so the
          // unconnected state says so plainly instead of showing zeros that
          // look like a wiped balance.
          <div className="rounded-2xl border border-ac-border bg-ac-bg-card p-6 text-center">
            <p className="text-sm font-semibold text-foreground">Connect your wallet</p>
            <p className="mx-auto mt-2 max-w-[18rem] text-xs leading-relaxed text-ac-muted">
              Your {TOKEN.ticker} balance, referral tree and rewards are read straight from{" "}
              {TOKEN.chain}. Nothing is stored in this app.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ac-violet px-6 py-4 text-base font-bold text-black transition hover:brightness-110 active:scale-[0.98]"
        >
          Open Dashboard
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <p className="text-center text-xs text-ac-muted">
          Buy {TOKEN.ticker}, track referrals, and claim rewards
        </p>
      </section>

      <nav className="mt-10 space-y-2">
        <Tile href="/referral-program" icon={Users} label="Referral program" />
        <Tile href="/roadmap" icon={MapIcon} label="Roadmap" />
        <Tile href="/" icon={ExternalLink} label="Full website" />
      </nav>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ac-border bg-ac-bg-card px-4 py-5 text-center">
      <p className="truncate text-xl font-bold text-ac-violet-light">{value}</p>
      <p className="mt-1 text-xs text-ac-muted">{label}</p>
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-ac-border bg-ac-bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:bg-ac-bg-elevated"
    >
      <Icon className="h-4 w-4 shrink-0 text-ac-muted" />
      {label}
    </Link>
  );
}
