"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, Radio } from "lucide-react";
import { WALLET_MUTATION_ERROR_EVENT } from "@/components/providers/Web3Provider";
import { wagmiConfig } from "@/lib/wagmi";

// Wallet-connect failures are otherwise silent to a real user -- wagmi's
// connect mutation stores the error in internal state rather than throwing
// it, and RainbowKit's own modal doesn't always surface it. This renders
// whatever Web3Provider's MutationCache catches, plus two things that sit
// outside react-query entirely: a raw window error/unhandledrejection
// listener (catches anything thrown before a mutation even starts), and a
// live readout of wagmi's own connection status (shows whether a connect
// attempt is reaching wagmi's state machine at all, or getting stuck
// earlier in RainbowKit's own wallet-selection step).
export default function ConnectErrorBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    function handleMutationError(e: Event) {
      const detail = (e as CustomEvent).detail;
      setMessage(detail instanceof Error ? detail.message : String(detail));
    }
    function handleWindowError(e: ErrorEvent) {
      setMessage(`${e.message} (${e.filename}:${e.lineno})`);
    }
    function handleRejection(e: PromiseRejectionEvent) {
      const reason = e.reason;
      setMessage(`Unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
    }

    window.addEventListener(WALLET_MUTATION_ERROR_EVENT, handleMutationError);
    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleRejection);

    const unsubscribe = wagmiConfig.subscribe(
      (state) => state.status,
      (next) => setStatus(next)
    );

    return () => {
      window.removeEventListener(WALLET_MUTATION_ERROR_EVENT, handleMutationError);
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleRejection);
      unsubscribe();
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-24 right-5 z-[100] flex items-center gap-1.5 rounded-full border border-ac-border bg-ac-bg-elevated px-3 py-1.5 text-[10px] font-mono text-ac-muted shadow-lg sm:bottom-6 sm:right-24">
        <Radio className="h-3 w-3 text-ac-cyan" />
        wagmi: {status}
      </div>

      {message && (
        <div className="fixed bottom-36 left-1/2 z-[100] flex w-[calc(100vw-2.5rem)] max-w-md -translate-x-1/2 items-start gap-2.5 rounded-xl border border-red-500/40 bg-[#1a0e12] px-4 py-3 text-xs text-red-200 shadow-2xl sm:bottom-20">
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
      )}
    </>
  );
}
