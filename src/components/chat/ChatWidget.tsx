"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "@/components/chat/ChatPanel";
import { getOrCreateVisitorId } from "@/lib/chatVisitorId";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Lazy initializer instead of an effect: getOrCreateVisitorId() is only
  // read once on mount, and visitorId is never used in the closed-state
  // markup, so there's nothing for a server/client hydration mismatch to
  // land on.
  const [visitorId] = useState(() => getOrCreateVisitorId());

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[calc(100vw-2.5rem)] max-w-sm flex-col rounded-2xl border border-ac-border bg-ac-bg-elevated p-4 shadow-2xl sm:right-8">
          <div className="mb-2 flex items-center justify-between border-b border-ac-border pb-3">
            <div>
              <p className="text-sm font-bold text-foreground">AgenticCore Assistant</p>
              <p className="text-xs text-ac-muted">Ask about AC, referrals, or the VIP Pool</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-ac-muted transition hover:bg-ac-bg-card hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {visitorId && (
            <ChatPanel endpointName="widget-chat" identityKey="visitorId" identityValue={visitorId} />
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ac-lime text-black shadow-xl transition hover:brightness-95 active:scale-95 sm:right-8"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
