// AgenticCore Token — records one page-visit row per page load. Called
// fire-and-forget from VisitTracker.tsx on every route change. No
// per-visitor identity captured (no IP, no user agent, no cookie/session
// id) -- this is a page-view counter, not visitor analytics.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : null;

  try {
    const { error } = await supabaseAdmin.from("page_visits").insert({ path, referrer });
    if (error) throw error;
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("track-visit: insert failed:", err);
    // Never let a tracking failure be visible to a real visitor -- still 200.
    return jsonResponse({ ok: false });
  }
}

Deno.serve(handleRequest);
