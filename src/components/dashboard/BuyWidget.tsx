"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ShieldCheck, AlertCircle, Lock } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { getMockPurchasedUsd } from "@/lib/mockWalletActivity";

const REFERENCE_PRICE_USD = 0.0000025;

export default function BuyWidget() {
  const { address } = useAccount();
  const purchasedUsd = useMemo(
    () => (address ? getMockPurchasedUsd(address) : 0),
    [address]
  );
  const remainingUsd = Math.max(0, Math.round((TOKEN.maxBuyUsd - purchasedUsd) * 100) / 100);
  const usedPct = Math.min(100, (purchasedUsd / TOKEN.maxBuyUsd) * 100);

  const [amount, setAmount] = useState("");
  const amountNum = Number(amount) || 0;
  const exceedsCap = amountNum > remainingUsd;
  const estimatedAc = amountNum > 0 ? amountNum / REFERENCE_PRICE_USD : 0;

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-ac-lime" />
        <h2 className="text-lg font-bold text-foreground">Buy AC</h2>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        Purchases are capped at ${TOKEN.maxBuyUsd} per wallet during launch —
        enforced on-chain to protect early price stability.
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-ac-muted">
          <span>Wallet cap used</span>
          <span>
            ${purchasedUsd.toFixed(2)} / ${TOKEN.maxBuyUsd}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ac-bg-elevated">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ac-violet to-ac-lime transition-all"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ac-muted">
          ${remainingUsd.toFixed(2)} remaining on this wallet.
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor="buy-amount" className="text-xs font-medium text-ac-muted">
          Amount (USD)
        </label>
        <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-ac-border bg-ac-bg/70 px-4 py-3 focus-within:border-ac-violet/60">
          <span className="text-sm text-ac-muted">$</span>
          <input
            id="buy-amount"
            type="number"
            min={0}
            max={TOKEN.maxBuyUsd}
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setAmount(String(remainingUsd))}
            className="shrink-0 rounded-full border border-ac-border px-3 py-1 text-xs font-semibold text-ac-muted transition hover:text-foreground"
          >
            Max
          </button>
        </div>

        {exceedsCap && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Exceeds your remaining ${remainingUsd.toFixed(2)} cap for this
            wallet.
          </p>
        )}

        {amountNum > 0 && !exceedsCap && (
          <p className="mt-2 text-xs text-ac-muted">
            ≈ {estimatedAc.toLocaleString(undefined, { maximumFractionDigits: 0 })} AC at
            reference price
          </p>
        )}
      </div>

      <button
        disabled
        className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-ac-border px-6 py-3.5 text-sm font-bold text-ac-muted"
      >
        <Lock className="h-4 w-4" />
        Contract not deployed yet
      </button>
      <p className="mt-3 text-center text-xs text-ac-muted/70">
        This widget previews the buy flow. The $100 cap will be enforced by
        the smart contract itself once {TOKEN.ticker} is live.
      </p>
    </div>
  );
}
