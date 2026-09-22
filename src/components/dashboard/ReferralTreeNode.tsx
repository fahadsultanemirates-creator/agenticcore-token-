"use client";

import { useState } from "react";
import { User } from "lucide-react";
import type { ReferralNode } from "@/lib/mockReferralData";

// Purely visual — no wallet addresses anywhere. Each referral is a plain
// yellow person-icon node; level, join date, and purchase size (already
// broken out in full in the reward-structure table/chart above this tree)
// live in a hover title instead of being printed on the node. Click a node
// to expand/collapse its own children, same interaction the old
// address-list tree had, just applied to a real branching diagram now —
// the row fans out left and right as siblings mount around it.
export default function ReferralTreeNode({
  node,
  defaultOpen = false,
}: {
  node: ReferralNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((v) => !v)}
        title={`Level ${node.level} · $${node.purchaseUsd.toFixed(2)} · joined ${node.joinedDaysAgo}d ago${
          hasChildren ? ` · ${node.children.length} referral${node.children.length === 1 ? "" : "s"}` : ""
        }`}
        aria-expanded={hasChildren ? open : undefined}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ac-lime/20 ring-2 transition ${
          node.level === 1 ? "ring-ac-lime/70" : "ring-ac-lime/35"
        } ${hasChildren ? "cursor-pointer hover:bg-ac-lime/30 hover:ring-ac-lime/80" : "cursor-default"}`}
      >
        <User className="h-4 w-4 text-ac-lime" />

        {hasChildren && !open && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-ac-bg-card bg-ac-lime px-1 text-[10px] font-bold text-ac-bg">
            {node.children.length}
          </span>
        )}
      </button>

      {hasChildren && open && (
        <ul>
          {node.children.map((child) => (
            <ReferralTreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
