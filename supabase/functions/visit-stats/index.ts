// AgenticCore Token — admin-facing page-visit counts, read from
// page_visits (populated by track-visit/index.ts). Aggregate counts only
// -- no per-row data is returned, so unlike recent-purchases this can't
// identify a specific visitor from the response either.

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

async function countSince(sinceIso: string | null): Promise<number> {
  let query = supabaseAdmin.from("page_visits").select("id", { count: "exact", head: true });
  if (sinceIso) query = query.gte("created_at", sinceIso);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const [last24h, last7d, last14d, last30d, total] = await Promise.all([
      countSince(new Date(now - DAY).toISOString()),
      countSince(new Date(now - 7 * DAY).toISOString()),
      countSince(new Date(now - 14 * DAY).toISOString()),
      countSince(new Date(now - 30 * DAY).toISOString()),
      countSince(null),
    ]);

    return jsonResponse({ last24h, last7d, last14d, last30d, total });
  } catch (err) {
    console.error("visit-stats: query failed:", err);
    return jsonResponse({ error: "Something went wrong on our end. Please try again in a moment." }, 500);
  }
}

Deno.serve(handleRequest);
