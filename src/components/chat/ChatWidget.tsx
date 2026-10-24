"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
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
        // Full-window takeover (not a small floating box) -- matches the
        // AgenticCore family's shared Maya pattern: a dedicated full-screen
        // chat, not a corner widget.
        <div className="fixed inset-0 z-50 flex flex-col bg-ac-bg">
          <div className="flex items-center gap-3 border-b border-ac-border px-5 py-4 sm:px-8">
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-ac-muted transition hover:bg-ac-bg-card hover:text-foreground"
              aria-label="Close chat"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ac-lime text-black">
              <span aria-hidden="true" className="h-9 w-9 rounded-full bg-cover bg-center" style={{backgroundImage:"url(/team/maya.webp)"}} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Maya</p>
              <p className="text-xs text-ac-muted">Your task assistant</p>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-5 py-4 sm:px-8">
            {visitorId && (
              <ChatPanel endpointName="widget-chat" identityKey="visitorId" identityValue={visitorId} />
            )}
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-ac-lime px-6 py-3.5 text-sm font-bold text-black shadow-xl shadow-ac-lime/20 transition hover:brightness-95 active:scale-95 sm:right-8"
          aria-label="Open Maya chat"
        >
          <Sparkles className="h-5 w-5" />
          Maya
        </button>
      )}
    </>
  );
}
