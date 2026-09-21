"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SALE_ABI, ERC20_ABI } from "@/lib/contracts";
import { getStoredReferrer, ZERO_ADDRESS } from "@/lib/referral";

const USDT_SCALE = BigInt("1000000000000000000"); // USDT (BEP-20) uses 18 decimals

export default function BuyWidget() {
  const { address } = useAccount();

  const { data: purchasedRaw, refetch: refetchPurchased } = useReadContract({
    address: TOKEN.presaleContractAddress,
    abi: SALE_ABI,
    functionName: "totalPurchasedUsd",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const purchasedUsd = purchasedRaw !== undefined ? Number(purchasedRaw) : 0;

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: TOKEN.usdtAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, TOKEN.presaleContractAddress] : undefined,
    query: { enabled: !!address },
  });

  const remainingUsd = Math.max(0, TOKEN.maxBuyUsd - purchasedUsd);
  const usedPct = Math.min(100, (purchasedUsd / TOKEN.maxBuyUsd) * 100);

  const [amount, setAmount] = useState("");
  // Contract takes whole USD only (MIN_BUY_USD / MAX_BUY_USD are integers,
  // and the buy() argument is multiplied by the USDT decimals scale directly
  // with no fractional handling) -- so round down to a whole dollar here.
  const amountNum = Math.floor(Number(amount) || 0);
  const belowMin = amountNum > 0 && amountNum < TOKEN.minBuyUsd;
  const exceedsCap = amountNum > remainingUsd;
  const estimatedAc = amountNum > 0 ? amountNum / TOKEN.startingPriceUsd : 0;

  const usdtAmountRaw = useMemo(() => BigInt(Math.max(0, amountNum)) * USDT_SCALE, [amountNum]);
  const needsApproval = allowanceRaw === undefined || allowanceRaw < usdtAmountRaw;
  const canSubmit = amountNum > 0 && !belowMin && !exceedsCap && !!address;

  const approve = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });
  const buy = useWriteContract();
  const buyReceipt = useWaitForTransactionReceipt({ hash: buy.data });

  useEffect(() => {
    if (approveReceipt.isSuccess) refetchAllowance();
  }, [approveReceipt.isSuccess, refetchAllowance]);

  useEffect(() => {
    if (!buyReceipt.isSuccess) return;
    refetchPurchased();
    refetchAllowance();
    // Deferred rather than called directly in the effect body -- this
    // reacts to an external event (the tx confirming), not local render
    // state, so it isn't the "derive state from props" case that rule
    // guards against, but it still shouldn't fire synchronously mid-effect.
    const timeout = setTimeout(() => setAmount(""), 0);
    return () => clearTimeout(timeout);
  }, [buyReceipt.isSuccess, refetchPurchased, refetchAllowance]);

  const handleApprove = () => {
    approve.writeContract({
      address: TOKEN.usdtAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      // Approve exactly this purchase's amount -- not unlimited -- so a
      // compromised or buggy dApp session can't drain more than the buyer
      // explicitly intended to spend right now.
      args: [TOKEN.presaleContractAddress, usdtAmountRaw],
    });
  };

  const handleBuy = () => {
    const referrer = getStoredReferrer();
    buy.writeContract({
      address: TOKEN.presaleContractAddress,
      abi: SALE_ABI,
      functionName: "buy",
      args: [BigInt(amountNum), referrer],
    });
  };

  const approving = approve.isPending || approveReceipt.isLoading;
  const buying = buy.isPending || buyReceipt.isLoading;
  const referrer = getStoredReferrer();
  const hasReferrer = referrer !== ZERO_ADDRESS;

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-ac-lime" />
        <h2 className="text-lg font-bold text-foreground">Buy AC</h2>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        Purchases run ${TOKEN.minBuyUsd}&ndash;${TOKEN.maxBuyUsd} per wallet,
        paid in USDT (BEP-20) — enforced on-chain to protect early price
        stability.
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
          Amount (USDT, whole dollars)
        </label>
        <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-ac-border bg-ac-bg/70 px-4 py-3 focus-within:border-ac-violet/60">
          <span className="text-sm text-ac-muted">$</span>
          <input
            id="buy-amount"
            type="number"
            min={TOKEN.minBuyUsd}
            max={TOKEN.maxBuyUsd}
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(remainingUsd)))}
            className="shrink-0 rounded-full border border-ac-border px-3 py-1 text-xs font-semibold text-ac-muted transition hover:text-foreground"
          >
            Max
          </button>
        </div>

        {belowMin && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Below the ${TOKEN.minBuyUsd} minimum buy.
          </p>
        )}

        {exceedsCap && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Exceeds your remaining ${remainingUsd.toFixed(2)} cap for this
            wallet.
          </p>
        )}

        {amountNum > 0 && !exceedsCap && !belowMin && (
          <p className="mt-2 text-xs text-ac-muted">
            ≈ {estimatedAc.toLocaleString(undefined, { maximumFractionDigits: 0 })} AC at
            starting price{hasReferrer ? " + 10% referral bonus" : ""}
          </p>
        )}

        <p className="mt-2 text-xs text-ac-muted/70">
          {hasReferrer
            ? "Buying through a referral link — bonus AC and upline commissions apply."
            : "No referral link detected — this buy skips the referral bonus AC and commissions. Use a referral link to earn them."}
        </p>
      </div>

      {needsApproval ? (
        <button
          type="button"
          disabled={!canSubmit || approving}
          onClick={handleApprove}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ac-violet px-6 py-3.5 text-sm font-bold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-ac-border disabled:text-ac-muted"
        >
          {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {approving ? "Approving USDT…" : "Approve USDT"}
        </button>
      ) : (
        <button
          type="button"
          disabled={!canSubmit || buying}
          onClick={handleBuy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ac-lime px-6 py-3.5 text-sm font-bold text-ac-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-ac-border disabled:text-ac-muted"
        >
          {buying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {buying ? "Confirming purchase…" : `Buy $${amountNum || 0} in AC`}
        </button>
      )}

      {buyReceipt.isSuccess && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ac-lime">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Purchase confirmed on-chain.
        </p>
      )}
      {(approve.error || approveReceipt.error || buy.error || buyReceipt.error) && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-red-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {(approve.error || approveReceipt.error || buy.error || buyReceipt.error)?.message ??
            "Transaction failed."}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-ac-muted/70">
        Two transactions for your first buy: approve USDT, then confirm the
        purchase. Buying via a referral link mints extra AC automatically.
      </p>
    </div>
  );
}
