"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import type { ReferralNode } from "@/lib/mockReferralData";
import ReferralAddressTreeNode from "@/components/dashboard/ReferralAddressTreeNode";
import { REFERRAL_LEVELS } from "@/lib/referral";

// The original address-list tree, kept alongside the newer visual "Referral
// tree" diagram (which deliberately hides addresses) -- some people want
// the actual wallet addresses in their downline, not just the shape of it,
// so this gives both views on the same underlying data.
export default function ReferralAddressTreeView({ tree }: { tree: ReferralNode[] }) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-ac-lime" />
          <h2 className="text-lg font-bold text-foreground">Downline address list</h2>
        </div>
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="rounded-full border border-ac-border px-3.5 py-1.5 text-xs font-semibold text-ac-muted transition hover:border-ac-violet/50 hover:text-foreground"
        >
          {expandAll ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        Every wallet in your downline, organized by level — down to level {REFERRAL_LEVELS}. Same tree as
        above, shown with addresses instead of the diagram view.
      </p>

      <div className="mt-5">
        {tree.length === 0 ? (
          <EmptyState />
        ) : (
          <div key={expandAll ? "open" : "closed"}>
            {tree.map((node) => (
              <ReferralAddressTreeNode key={node.id} node={node} defaultOpen={expandAll} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-ac-border py-10 text-center">
      <p className="text-sm text-ac-muted">
        No referrals yet. Share your link above to start building your tree.
      </p>
    </div>
  );
}
