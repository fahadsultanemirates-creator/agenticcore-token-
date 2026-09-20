// AgenticCore Token — Supabase project config for the chat widget / Forge
// panel. This is the publishable key, safe for browser use -- security is
// enforced by RLS on the database (bot_conversations/bot_messages are
// locked down entirely; only the Edge Functions' service role touches
// them). No supabase-js client is loaded here -- these functions are
// called with a plain fetch(), same pattern as the sibling AgenticCore
// sites' chat-widget.js.
export const SUPABASE_URL = "https://zbcqyzggslgxzkeiryws.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fz28s8_sozszmEms9tvE4Q_nDUvQl0c";
