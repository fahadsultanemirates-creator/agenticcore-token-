// AgenticCore Token — Forge, the dashboard's own assistant. Same brain as
// the widget and Telegram bot (handleIncomingMessage on the 'forge'
// channel in ../_shared/bot-core.ts), reached from inside the dashboard
// once a wallet is connected.
//
// Unlike the sibling AgenticCore sites' forge-chat, there is no Supabase
// Auth session to verify here -- this project has no email/password login
// at all, only a connected wallet. The wallet address is taken as given
// from the request body (the same trust boundary the rest of this app
// already runs on -- nothing here reads real on-chain balances or moves
// value, and signature-based wallet verification is a documented, not yet
// built, future hardening step). A bare format check keeps out garbage.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleIncomingMessage, getConversationHistory } from "../_shared/bot-core.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") || undefined;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGE_LENGTH = 4000;
const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function isValidWalletAddress(address: unknown): address is string {
  return typeof address === "string" && EVM_ADDRESS_PATTERN.test(address);
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { walletAddress, action, message, languageHint } = body || {};

  if (!isValidWalletAddress(walletAddress)) {
    return jsonResponse({ error: "Missing or invalid walletAddress" }, 400);
  }
  const normalizedAddress = walletAddress.toLowerCase();

  if (action === "history") {
    const history = await getConversationHistory(supabaseAdmin, "forge", normalizedAddress);
    return jsonResponse({
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
  }

  if (action === "message") {
    if (typeof message !== "string" || message.trim() === "") {
      return jsonResponse({ error: "Missing message" }, 400);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: "Message too long" }, 400);
    }

    try {
      const result = await handleIncomingMessage({
        supabaseAdmin,
        channel: "forge",
        externalId: normalizedAddress,
        userMessage: message,
        anthropicApiKey: ANTHROPIC_API_KEY,
        model: ANTHROPIC_MODEL,
        languageHint: typeof languageHint === "string" ? languageHint : undefined,
      });

      return jsonResponse({ reply: result.reply, needsHuman: result.needsHuman });
    } catch (err) {
      console.error("forge-chat: handleIncomingMessage failed:", err);
      return jsonResponse({ error: "Something went wrong on our end. Please try again in a moment." }, 500);
    }
  }

  return jsonResponse({ error: 'Unknown action -- expected "message" or "history"' }, 400);
}

Deno.serve(handleRequest);
