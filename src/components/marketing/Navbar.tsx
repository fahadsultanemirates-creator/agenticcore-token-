"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ConnectWalletButton from "@/components/ui/ConnectWalletButton";

const LINKS = [
  { href: "#tokenomics", label: "Tokenomics" },
  { href: "#how-to-buy", label: "How to Buy" },
  { href: "#referral", label: "Referrals" },
  { href: "#presale", label: "Launch" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ac-border/70 bg-ac-bg/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ac-violet to-ac-violet-dark text-sm font-black text-white">
            AC
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">
            AgenticCore
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ac-muted transition hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-ac-muted transition hover:text-foreground sm:block"
          >
            Dashboard
          </Link>
          <div className="hidden sm:block">
            <ConnectWalletButton compact />
          </div>
          <button
            className="rounded-md p-2 text-ac-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-ac-border bg-ac-bg px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ac-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ac-muted hover:text-foreground"
            >
              Dashboard
            </Link>
            <ConnectWalletButton />
          </div>
        </div>
      )}
    </header>
  );
}
