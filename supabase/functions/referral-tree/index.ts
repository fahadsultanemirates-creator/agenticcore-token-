// AgenticCore Token — serves a wallet's real referral tree from the
// sale_purchases table (populated by index-sale-events/index.ts), in the
// same ReferralNode[] shape the frontend's mock data already used (see
// src/lib/mockReferralData.ts) so the existing summarizeTreeByLevel() /
// totalReferrals() helpers work unchanged against real data.
//
// Trust model matches forge-chat/dashboard-cards: no signature
// verification, same documented boundary the rest of this app runs on.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const REFERRAL_LEVELS = 10;
// Hard cap so one huge tree can't blow up the response -- matches the
// spirit of mockReferralData's own ~30-node illustrative budget, just with
// enough headroom for a real, large downline.
const MAX_NODES = 2000;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ReferralNode {
  id: string;
  address: string;
  level: number;
  joinedDaysAgo: number;
  purchaseUsd: number;
  children: ReferralNode[];
}

interface PurchaseRow {
  buyer_address: string;
  usdt_amount: number;
  block_timestamp: string | null;
  created_at: string;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function fetchChildrenOf(referrer: string): Promise<PurchaseRow[]> {
  const { data, error } = await supabaseAdmin
    .from("sale_purchases")
    .select("buyer_address, usdt_amount, block_timestamp, created_at")
    .eq("referrer_address", referrer);
  if (error) throw error;
  return (data as PurchaseRow[]) ?? [];
}

function daysAgo(isoTimestamp: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 86_400_000));
}

async function buildTree(rootAddress: string): Promise<ReferralNode[]> {
  const budget = { remaining: MAX_NODES };

  async function level(address: string, lvl: number, path: string): Promise<ReferralNode[]> {
    if (lvl > REFERRAL_LEVELS || budget.remaining <= 0) return [];
    const rows = await fetchChildrenOf(address);
    const nodes: ReferralNode[] = [];
    for (const row of rows) {
      if (budget.remaining <= 0) break;
      budget.remaining -= 1;
      const id = `${path}-${lvl}-${row.buyer_address}`;
      nodes.push({
        id,
        address: row.buyer_address,
        level: lvl,
        joinedDaysAgo: daysAgo(row.block_timestamp ?? row.created_at),
        purchaseUsd: Number(row.usdt_amount),
        children: await level(row.buyer_address, lvl + 1, id),
      });
    }
    return nodes;
  }

  return level(rootAddress, 1, "root");
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

  const { walletAddress } = body || {};
  if (typeof walletAddress !== "string" || !EVM_ADDRESS_PATTERN.test(walletAddress)) {
    return jsonResponse({ error: "Missing or invalid walletAddress" }, 400);
  }

  try {
    const tree = await buildTree(walletAddress.toLowerCase());
    return jsonResponse({ source: "indexer", tree });
  } catch (err) {
    console.error("referral-tree: buildTree failed:", err);
    return jsonResponse({ error: "Something went wrong on our end. Please try again in a moment." }, 500);
  }
}

Deno.serve(handleRequest);
