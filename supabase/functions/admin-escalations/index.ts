// AgenticCore Token — admin-only endpoint listing bot conversations flagged
// needs_human=true (real problems, out-of-brief questions, frustration --
// see business-knowledge.ts's escalation rules) so the one admin wallet can
// review and resolve them from /admin. bot_conversations/bot_messages have
// RLS enabled with no policies, so this (running with the service role key)
// is the only way to read them outside the database itself.
//
// Trust model matches forge-chat: the wallet address is taken as given from
// the request body, checked server-side against the single hardcoded admin
// address -- there is no email/password session to verify against, only a
// connected wallet, same as the rest of this app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_ADDRESS = "0x170BEc84cD2Be039C30BefE09a57f6a132cf5c60".toLowerCase();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
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

  const { walletAddress, action, conversationId } = body || {};
  if (typeof walletAddress !== "string" || !EVM_ADDRESS_PATTERN.test(walletAddress)) {
    return jsonResponse({ error: "Missing or invalid walletAddress" }, 400);
  }
  if (walletAddress.toLowerCase() !== ADMIN_ADDRESS) {
    return jsonResponse({ error: "Not authorized" }, 403);
  }

  if (action === "resolve") {
    if (typeof conversationId !== "string") {
      return jsonResponse({ error: "Missing conversationId" }, 400);
    }
    const { error } = await supabaseAdmin
      .from("bot_conversations")
      .update({ needs_human: false })
      .eq("id", conversationId);
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ ok: true });
  }

  // Default action: list open escalations with their most recent messages.
  const { data: conversations, error } = await supabaseAdmin
    .from("bot_conversations")
    .select("id, channel, external_id, language, created_at, updated_at")
    .eq("needs_human", true)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) return jsonResponse({ error: error.message }, 500);

  const withMessages = await Promise.all(
    (conversations || []).map(async (c: any) => {
      const { data: messages } = await supabaseAdmin
        .from("bot_messages")
        .select("role, content, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(6);
      return { ...c, recentMessages: (messages || []).reverse() };
    })
  );

  return jsonResponse({ conversations: withMessages });
}

Deno.serve(handleRequest);
