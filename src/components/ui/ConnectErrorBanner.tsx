"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { WALLET_MUTATION_ERROR_EVENT } from "@/components/providers/Web3Provider";

// Wallet-connect failures are otherwise silent to a real user -- wagmi's
// connect mutation stores the error in internal state rather than throwing
// it, and RainbowKit's own modal doesn't always surface it. This renders
// whatever Web3Provider's MutationCache catches, so a failed connection
// attempt is never just "nothing happened."
export default function ConnectErrorBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleError(e: Event) {
      const detail = (e as CustomEvent).detail;
      setMessage(detail instanceof Error ? detail.message : String(detail));
    }
    window.addEventListener(WALLET_MUTATION_ERROR_EVENT, handleError);
    return () => window.removeEventListener(WALLET_MUTATION_ERROR_EVENT, handleError);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[100] flex w-[calc(100vw-2.5rem)] max-w-md -translate-x-1/2 items-start gap-2.5 rounded-xl border border-red-500/40 bg-[#1a0e12] px-4 py-3 text-xs text-red-200 shadow-2xl sm:bottom-6">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-red-300">Wallet connect error</p>
        <p className="mt-0.5 break-words text-red-200/90">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="shrink-0 rounded-full p-1 text-red-300/70 transition hover:text-red-200"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
