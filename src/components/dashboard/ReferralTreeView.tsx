import { Users } from "lucide-react";
import type { ReferralNode } from "@/lib/mockReferralData";
import ReferralTreeNode from "@/components/dashboard/ReferralTreeNode";

export default function ReferralTreeView({ tree }: { tree: ReferralNode[] }) {
  return (
    <div className="card-surface rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-ac-lime" />
        <h2 className="text-lg font-bold text-foreground">Referral tree</h2>
      </div>
      <p className="mt-1 text-sm text-ac-muted">
        The shape of your downline. Click a node to expand its referrals, hover for level, join date, and
        purchase size — no wallet addresses shown here; the full numbers are in the table below.
      </p>

      <div className="mt-6">
        {tree.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="org-tree overflow-x-auto pb-2">
            <ul className="min-w-max">
              <li>
                <div
                  title="You"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ac-lime text-ac-bg ring-4 ring-ac-lime/20"
                >
                  <Users className="h-5 w-5" />
                </div>
                <ul>
                  {tree.map((node) => (
                    <ReferralTreeNode key={node.id} node={node} defaultOpen />
                  ))}
                </ul>
              </li>
            </ul>
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
