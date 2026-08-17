"use client";

import { useState } from "react";
import { ChevronRight, User } from "lucide-react";
import type { ReferralNode } from "@/lib/mockReferralData";
import { getReferralLevelRates, formatPct } from "@/lib/referral";

const RATES = getReferralLevelRates();

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function ReferralTreeNode({
  node,
  defaultOpen = false,
}: {
  node: ReferralNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = node.children.length > 0;
  const rate = RATES.find((r) => r.level === node.level)?.pct ?? 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg py-2 pl-1 pr-2 transition hover:bg-ac-bg-elevated">
        <button
          onClick={() => hasChildren && setOpen((v) => !v)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
            hasChildren ? "text-ac-muted hover:text-foreground" : "opacity-0"
          }`}
          disabled={!hasChildren}
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ac-violet/15">
          <User className="h-3.5 w-3.5 text-ac-violet-light" />
        </div>

        <span className="font-mono text-sm text-foreground">{shortAddress(node.address)}</span>

        <span className="rounded-full border border-ac-border px-2 py-0.5 text-[11px] font-medium text-ac-muted">
          L{node.level} · {formatPct(rate)}
        </span>

        <span className="ml-auto whitespace-nowrap text-xs text-ac-muted">
          ${node.purchaseUsd.toFixed(2)} · {node.joinedDaysAgo}d ago
        </span>

        {hasChildren && (
          <span className="whitespace-nowrap text-xs font-medium text-ac-cyan">
            {node.children.length} referral{node.children.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {hasChildren && open && (
        <div className="ml-6 border-l border-ac-border pl-2">
          {node.children.map((child) => (
            <ReferralTreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
