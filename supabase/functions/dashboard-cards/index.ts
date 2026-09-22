// AgenticCore Token — stores the display name a wallet picks when it
// activates one of its AC membership cards (Standard/VIP/Apex). Everything
// else on the cards (which tiers are unlocked, total invested) is derived
// live from on-chain reads and the existing mock referral/VIP data on the
// client; this table only holds the one piece of real, persistent state a
// user actually types in.
//
// Trust model matches forge-chat/admin-escalations: the wallet address is
// taken as given from the request body, no signature verification -- same
// boundary the rest of this app already runs on. dashboard_cards has RLS
// enabled with no policies, so this (running with the service role key) is
// the only way to touch it outside the database itself.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const MAX_NAME_LENGTH = 40;

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

  const { walletAddress, action, cardName } = body || {};
  if (typeof walletAddress !== "string" || !EVM_ADDRESS_PATTERN.test(walletAddress)) {
    return jsonResponse({ error: "Missing or invalid walletAddress" }, 400);
  }
  const normalizedAddress = walletAddress.toLowerCase();

  if (action === "save") {
    const trimmed = typeof cardName === "string" ? cardName.trim() : "";
    if (!trimmed) {
      return jsonResponse({ error: "Missing cardName" }, 400);
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return jsonResponse({ error: `cardName must be ${MAX_NAME_LENGTH} characters or fewer` }, 400);
    }

    const { error } = await supabaseAdmin
      .from("dashboard_cards")
      .upsert(
        { wallet_address: normalizedAddress, card_name: trimmed, updated_at: new Date().toISOString() },
        { onConflict: "wallet_address" }
      );
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ cardName: trimmed });
  }

  // Default action: fetch the stored card name, if any.
  const { data, error } = await supabaseAdmin
    .from("dashboard_cards")
    .select("card_name")
    .eq("wallet_address", normalizedAddress)
    .maybeSingle();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ cardName: data?.card_name ?? null });
}

Deno.serve(handleRequest);
