// Anonymous, per-browser id for the homepage chat widget (pre-connect
// visitors have no wallet yet). Same pattern as the sibling AgenticCore
// sites' visit-tracker/chat-widget scripts, ported to a small React hook.
const VISITOR_ID_KEY = "ac_chat_visitor_id";

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // Private browsing / blocked storage -- fall back to a per-load id
    // rather than crashing the widget.
    return crypto.randomUUID();
  }
}
