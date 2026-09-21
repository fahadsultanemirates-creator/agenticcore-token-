"use client";

import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { TOKEN } from "@/lib/tokenConfig";
import { SALE_ABI, TOKEN_ABI } from "@/lib/contracts";

function ActionCard({
  title,
  danger,
  children,
}: {
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-5 ${danger ? "border-red-500/30 bg-red-500/5" : "border-ac-border bg-ac-bg/60"}`}>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function AddressForm({
  buttonLabel,
  pendingLabel,
  functionName,
  address,
  abi,
}: {
  buttonLabel: string;
  pendingLabel: string;
  functionName: "setTreasury" | "setMarketingWallet";
  address: `0x${string}`;
  abi: typeof SALE_ABI;
}) {
  const [value, setValue] = useState("");
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data });
  const busy = write.isPending || receipt.isLoading;
  const valid = /^0x[a-fA-F0-9]{40}$/.test(value);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="0x..."
        className="flex-1 rounded-lg border border-ac-border bg-ac-bg px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-ac-violet/60"
      />
      <button
        type="button"
        disabled={!valid || busy}
        onClick={() => {
          write.reset();
          write.writeContract({ address, abi, functionName, args: [value as `0x${string}`] });
        }}
        className="shrink-0 rounded-lg bg-ac-violet px-4 py-2 text-sm font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? pendingLabel : buttonLabel}
      </button>
      {receipt.isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0 text-ac-lime" />}
      {(write.error || receipt.error) && (
        <p className="text-xs text-red-400">{(write.error || receipt.error)?.message}</p>
      )}
    </div>
  );
}

function WalletCapExemptForm() {
  const [addr, setAddr] = useState("");
  const [exempt, setExempt] = useState(true);
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data });
  const busy = write.isPending || receipt.isLoading;
  const valid = /^0x[a-fA-F0-9]{40}$/.test(addr);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        placeholder="0x..."
        className="flex-1 rounded-lg border border-ac-border bg-ac-bg px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-ac-violet/60"
      />
      <select
        value={exempt ? "exempt" : "capped"}
        onChange={(e) => setExempt(e.target.value === "exempt")}
        className="rounded-lg border border-ac-border bg-ac-bg px-3 py-2 text-sm text-foreground"
      >
        <option value="exempt">Exempt</option>
        <option value="capped">Capped</option>
      </select>
      <button
        type="button"
        disabled={!valid || busy}
        onClick={() => {
          write.reset();
          write.writeContract({
            address: TOKEN.contractAddress,
            abi: TOKEN_ABI,
            functionName: "setWalletCapExempt",
            args: [addr as `0x${string}`, exempt],
          });
        }}
        className="shrink-0 rounded-lg bg-ac-violet px-4 py-2 text-sm font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Setting…" : "Set"}
      </button>
      {receipt.isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0 text-ac-lime" />}
      {(write.error || receipt.error) && (
        <p className="text-xs text-red-400">{(write.error || receipt.error)?.message}</p>
      )}
    </div>
  );
}

export default function AdminActions() {
  const { data: nextPayoutTimestamp } = useReadContract({
    address: TOKEN.presaleContractAddress,
    abi: SALE_ABI,
    functionName: "nextPayoutTimestamp",
  });
  const nextPayoutLabel = nextPayoutTimestamp
    ? new Date(Number(nextPayoutTimestamp) * 1000).toUTCString()
    : "—";

  const closeWeek = useWriteContract();
  const closeWeekReceipt = useWaitForTransactionReceipt({ hash: closeWeek.data });

  const disableAntiWhale = useWriteContract();
  const disableAntiWhaleReceipt = useWaitForTransactionReceipt({ hash: disableAntiWhale.data });

  return (
    <div className="card-surface rounded-2xl p-6">
      <h2 className="text-lg font-bold text-foreground">Admin actions</h2>
      <p className="mt-1 text-sm text-ac-muted">
        Every action below is enforced on-chain by the contracts&apos; own
        owner check — this page is a convenience, not the security boundary.
      </p>

      <div className="mt-5 space-y-4">
        <ActionCard title="Close the current VIP Pool week">
          <p className="mb-3 text-xs text-ac-muted">
            Callable by anyone once the payout time passes — this just saves
            waiting for a random user to trigger it. Next payout time (UTC):{" "}
            {nextPayoutLabel}. Reverts on-chain with &quot;week not over
            yet&quot; if clicked early.
          </p>
          <button
            type="button"
            disabled={closeWeek.isPending || closeWeekReceipt.isLoading}
            onClick={() => {
              closeWeek.reset();
              closeWeek.writeContract({
                address: TOKEN.presaleContractAddress,
                abi: SALE_ABI,
                functionName: "closeCurrentWeek",
              });
            }}
            className="flex items-center gap-2 rounded-lg bg-ac-lime px-4 py-2 text-sm font-semibold text-ac-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {closeWeek.isPending || closeWeekReceipt.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Close week
          </button>
          {closeWeekReceipt.isSuccess && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ac-lime">
              <CheckCircle2 className="h-3.5 w-3.5" /> Week closed.
            </p>
          )}
          {(closeWeek.error || closeWeekReceipt.error) && (
            <p className="mt-2 text-xs text-red-400">{(closeWeek.error || closeWeekReceipt.error)?.message}</p>
          )}
        </ActionCard>

        <ActionCard title="Set treasury wallet">
          <AddressForm
            buttonLabel="Update"
            pendingLabel="Updating…"
            functionName="setTreasury"
            address={TOKEN.presaleContractAddress}
            abi={SALE_ABI}
          />
        </ActionCard>

        <ActionCard title="Set marketing spend wallet">
          <AddressForm
            buttonLabel="Update"
            pendingLabel="Updating…"
            functionName="setMarketingWallet"
            address={TOKEN.presaleContractAddress}
            abi={SALE_ABI}
          />
        </ActionCard>

        <ActionCard title="Set wallet-cap exemption">
          <p className="mb-3 text-xs text-ac-muted">
            Needed for any address that should legitimately hold more than 1%
            of supply (e.g. a future PancakeSwap pair address).
          </p>
          <WalletCapExemptForm />
        </ActionCard>

        <ActionCard title="Disable the anti-whale wallet cap" danger>
          <div className="mb-3 flex items-start gap-2 text-xs text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Permanent and one-way — there is no function to turn it back on.
              Only do this when ready for unrestricted trading (e.g. after the
              PancakeSwap pool is live and stable).
            </span>
          </div>
          <button
            type="button"
            disabled={disableAntiWhale.isPending || disableAntiWhaleReceipt.isLoading}
            onClick={() => {
              if (!window.confirm("This permanently disables the anti-whale cap. Continue?")) return;
              disableAntiWhale.reset();
              disableAntiWhale.writeContract({
                address: TOKEN.contractAddress,
                abi: TOKEN_ABI,
                functionName: "disableAntiWhale",
              });
            }}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {disableAntiWhale.isPending || disableAntiWhaleReceipt.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Disable anti-whale cap
          </button>
          {disableAntiWhaleReceipt.isSuccess && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ac-lime">
              <CheckCircle2 className="h-3.5 w-3.5" /> Disabled.
            </p>
          )}
          {(disableAntiWhale.error || disableAntiWhaleReceipt.error) && (
            <p className="mt-2 text-xs text-red-400">
              {(disableAntiWhale.error || disableAntiWhaleReceipt.error)?.message}
            </p>
          )}
        </ActionCard>
      </div>
    </div>
  );
}
