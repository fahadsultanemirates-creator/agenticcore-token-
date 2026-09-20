"use client";

import { Sparkles } from "lucide-react";
import ChatPanel from "@/components/chat/ChatPanel";

export default function ForgeChat({ address }: { address: string }) {
  return (
    <div className="card-surface flex h-[480px] flex-col rounded-2xl p-6">
      <div className="mb-2 flex items-center gap-2 border-b border-ac-border pb-3">
        <Sparkles className="h-4 w-4 text-ac-lime" />
        <div>
          <h2 className="text-lg font-bold text-foreground">Forge</h2>
          <p className="text-xs text-ac-muted">Your dashboard assistant — ask about your referrals, the VIP Pool, or anything AC.</p>
        </div>
      </div>
      <ChatPanel
        endpointName="forge-chat"
        identityKey="walletAddress"
        identityValue={address}
        placeholder="Ask Forge anything..."
        emptyState="Ask Forge about your referral tree, VIP Pool progress, or how the buy range works."
      />
    </div>
  );
}
