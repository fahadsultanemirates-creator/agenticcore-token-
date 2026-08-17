"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ConnectWalletButton from "@/components/ui/ConnectWalletButton";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ac-border/70 bg-ac-bg/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ac-violet to-ac-violet-dark text-sm font-black text-white">
            AC
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline">
            AgenticCore
          </span>
        </Link>

        <Link
          href="/"
          className="hidden items-center gap-1.5 text-sm font-medium text-ac-muted transition hover:text-foreground sm:flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <ConnectWalletButton />
      </nav>
    </header>
  );
}
