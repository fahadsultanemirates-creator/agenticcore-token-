// AgenticCore Token — admin-facing feed of the most recent real purchases,
// read from sale_purchases (populated by index-sale-events/index.ts from
// the Sale contract's own Purchase events). This is public blockchain data
// -- anyone could read the same rows off BscScan -- so unlike forge-chat/
// admin-escalations this isn't gated to the admin wallet; it just isn't
// linked from anywhere but the admin page.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

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
    body = await req.json().catch(() => ({}));
  } catch {
    body = {};
  }
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(body?.limit) || DEFAULT_LIMIT));

  try {
    const { data, error } = await supabaseAdmin
      .from("sale_purchases")
      .select("tx_hash, block_timestamp, created_at, buyer_address, referrer_address, usdt_amount, ac_amount, referred")
      .order("block_timestamp", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw error;

    return jsonResponse({ purchases: data ?? [] });
  } catch (err) {
    console.error("recent-purchases: query failed:", err);
    return jsonResponse({ error: "Something went wrong on our end. Please try again in a moment." }, 500);
  }
}

Deno.serve(handleRequest);
