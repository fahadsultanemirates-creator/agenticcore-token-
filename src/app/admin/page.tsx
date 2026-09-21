"use client";

import { useAccount } from "wagmi";
import { ShieldAlert, Wallet } from "lucide-react";
import ConnectWalletButton from "@/components/ui/ConnectWalletButton";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminStats from "@/components/admin/AdminStats";
import AdminActions from "@/components/admin/AdminActions";
import AdminEscalations from "@/components/admin/AdminEscalations";
import { ADMIN_ADDRESS } from "@/lib/tokenConfig";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const isAdmin = isConnected && address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  return (
    <>
      <DashboardHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-5 py-10 sm:px-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Admin</h1>
          <p className="mt-1 text-sm text-ac-muted">
            Gated to a single wallet — connecting is the only sign-in, same
            as the rest of this app.
          </p>
        </div>

        {!isConnected && (
          <div className="card-surface flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
            <Wallet className="h-8 w-8 text-ac-violet-light" />
            <p className="text-sm text-ac-muted">Connect the admin wallet to continue.</p>
            <ConnectWalletButton />
          </div>
        )}

        {isConnected && !isAdmin && (
          <div className="card-surface flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center">
            <ShieldAlert className="h-8 w-8 text-red-400" />
            <p className="text-sm text-foreground">This wallet isn&apos;t authorized for admin access.</p>
            <p className="font-mono text-xs text-ac-muted">{address}</p>
          </div>
        )}

        {isAdmin && address && (
          <>
            <AdminStats />
            <AdminActions />
            <AdminEscalations walletAddress={address} />
          </>
        )}
      </main>
    </>
  );
}
