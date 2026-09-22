"use client";

import { User } from "lucide-react";
import type { ReferralNode } from "@/lib/mockReferralData";

// Purely visual — no wallet addresses anywhere. Each referral is a plain
// person-icon node; level, join date, and purchase size (already broken
// out in full in the reward-structure table/chart above this tree) are
// tucked into a hover title instead of printed on the node itself, so the
// tree reads as a diagram of the network's shape, not a data table.
export default function ReferralTreeNode({ node }: { node: ReferralNode }) {
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        title={`Level ${node.level} · $${node.purchaseUsd.toFixed(2)} · joined ${node.joinedDaysAgo}d ago`}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
          node.level === 1
            ? "bg-ac-lime/15 ring-2 ring-ac-lime/50"
            : "bg-ac-violet/15 ring-1 ring-ac-violet/30"
        }`}
      >
        <User className={`h-4 w-4 ${node.level === 1 ? "text-ac-lime" : "text-ac-violet-light"}`} />
      </div>

      {hasChildren && (
        <ul>
          {node.children.map((child) => (
            <ReferralTreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
