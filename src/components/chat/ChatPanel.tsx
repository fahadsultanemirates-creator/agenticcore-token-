"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseConfig";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel({
  endpointName,
  identityKey,
  identityValue,
  placeholder = "Ask about AC...",
  emptyState = "Ask anything about the token, the referral program, or the VIP Pool.",
}: {
  endpointName: "widget-chat" | "forge-chat";
  identityKey: "visitorId" | "walletAddress";
  identityValue: string;
  placeholder?: string;
  emptyState?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const endpoint = `${SUPABASE_URL}/functions/v1/${endpointName}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [identityKey]: identityValue, action: "history" }),
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!cancelled && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch {
        // Best-effort -- an empty history is a fine fallback.
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityValue]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [identityKey]: identityValue, action: "message", message: text, languageHint: navigator.language }),
      });
      const data = await resp.json();
      const reply = resp.ok && data.reply ? data.reply : "Something went wrong on our end. Please try again in a moment.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong on our end. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {historyLoaded && messages.length === 0 && (
          <p className="rounded-xl border border-dashed border-ac-border px-4 py-6 text-center text-sm text-ac-muted">
            {emptyState}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-ac-violet text-white"
                  : "border border-ac-border bg-ac-bg-card text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-ac-border bg-ac-bg-card px-4 py-2.5 text-sm text-ac-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-ac-border pt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-ac-border bg-ac-bg/70 px-4 py-2.5 text-sm text-foreground outline-none focus:border-ac-violet/60"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ac-lime text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
