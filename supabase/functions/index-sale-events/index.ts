// AgenticCore Token — real referral-tree indexer. Polls the Sale contract's
// Purchase events from BSC and stores them in sale_purchases, so
// referral-tree/index.ts can serve a wallet's actual downline instead of
// the illustrative mock tree (see mockReferralData.ts / DemoModeBanner.tsx).
//
// Not triggered by user traffic -- call this on a schedule (e.g. every 5
// minutes) from an external cron (Supabase scheduled Edge Functions, or any
// HTTP cron hitting this URL with the X-Indexer-Secret header). Each call
// catches up at most MAX_BLOCK_RANGE blocks so a single invocation can't
// time out or hammer the RPC; a wallet with a very large backlog to index
// just needs a few extra scheduled runs to catch up, not a bigger timeout.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createPublicClient, http, parseAbiItem } from "https://esm.sh/viem@2.21.0";
import { bsc } from "https://esm.sh/viem@2.21.0/chains";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Public default works but is rate-limited and not meant for production
// polling -- set a dedicated BSC RPC endpoint (Ankr/QuickNode/etc.) in prod.
const BSC_RPC_URL = Deno.env.get("BSC_RPC_URL") || "https://bsc-dataseed.binance.org";
// Matches TOKEN.presaleContractAddress in src/lib/tokenConfig.ts.
const SALE_CONTRACT_ADDRESS = (Deno.env.get("SALE_CONTRACT_ADDRESS") ||
  "0xc9538dE177FD684704473041B81E2eC6CEc95679") as `0x${string}`;
// Block the Sale contract was deployed at -- set this to its real creation
// block (visible on the contract's BscScan page) so the first run doesn't
// scan from block 0. Left at 0 is safe but slow to catch up.
const SALE_DEPLOY_BLOCK = BigInt(Deno.env.get("SALE_DEPLOY_BLOCK") || "0");
const MAX_BLOCK_RANGE = BigInt(Deno.env.get("INDEXER_MAX_BLOCK_RANGE") || "2000");
const INDEXER_CRON_SECRET = Deno.env.get("INDEXER_CRON_SECRET");

const PURCHASE_EVENT = parseAbiItem(
  "event Purchase(address indexed buyer, address indexed referrer, uint256 usdtAmount, uint256 acAmount, bool referred)"
);

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const chainClient = createPublicClient({ chain: bsc, transport: http(BSC_RPC_URL) });

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getLastIndexedBlock(): Promise<bigint> {
  const { data } = await supabaseAdmin
    .from("indexer_state")
    .select("last_indexed_block")
    .eq("id", 1)
    .maybeSingle();
  if (data) return BigInt(data.last_indexed_block);
  return SALE_DEPLOY_BLOCK > 0n ? SALE_DEPLOY_BLOCK - 1n : 0n;
}

async function setLastIndexedBlock(block: bigint): Promise<void> {
  await supabaseAdmin
    .from("indexer_state")
    .upsert({ id: 1, last_indexed_block: Number(block), updated_at: new Date().toISOString() });
}

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Required: this endpoint drives real RPC calls on every invocation, so
  // it must not be left open to anonymous callers.
  if (!INDEXER_CRON_SECRET) {
    return jsonResponse({ error: "INDEXER_CRON_SECRET is not configured" }, 500);
  }
  if (req.headers.get("X-Indexer-Secret") !== INDEXER_CRON_SECRET) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const latestBlock = await chainClient.getBlockNumber();
    const lastIndexed = await getLastIndexedBlock();
    const fromBlock = lastIndexed + 1n;

    if (fromBlock > latestBlock) {
      return jsonResponse({ fromBlock: Number(fromBlock), toBlock: Number(lastIndexed), latestBlock: Number(latestBlock), purchasesIndexed: 0, caughtUp: true });
    }

    const toBlock = fromBlock + MAX_BLOCK_RANGE - 1n > latestBlock ? latestBlock : fromBlock + MAX_BLOCK_RANGE - 1n;

    const logs = await chainClient.getLogs({
      address: SALE_CONTRACT_ADDRESS,
      event: PURCHASE_EVENT,
      fromBlock,
      toBlock,
    });

    // Fetch each unique block's timestamp once, not once per log.
    const uniqueBlockNumbers = [...new Set(logs.map((l) => l.blockNumber))];
    const blockTimestamps = new Map<bigint, string>();
    for (const blockNumber of uniqueBlockNumbers) {
      if (blockNumber === null) continue;
      const block = await chainClient.getBlock({ blockNumber });
      blockTimestamps.set(blockNumber, new Date(Number(block.timestamp) * 1000).toISOString());
    }

    const rows = logs.map((log) => ({
      tx_hash: log.transactionHash,
      log_index: log.logIndex,
      block_number: Number(log.blockNumber),
      block_timestamp: log.blockNumber !== null ? blockTimestamps.get(log.blockNumber) ?? null : null,
      buyer_address: log.args.buyer!.toLowerCase(),
      referrer_address: log.args.referrer!.toLowerCase(),
      usdt_amount: Number(log.args.usdtAmount) / 1e18,
      ac_amount: Number(log.args.acAmount) / 1e18,
      referred: log.args.referred!,
    }));

    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from("sale_purchases")
        .upsert(rows, { onConflict: "tx_hash,log_index", ignoreDuplicates: true });
      if (error) throw error;
    }

    await setLastIndexedBlock(toBlock);

    return jsonResponse({
      fromBlock: Number(fromBlock),
      toBlock: Number(toBlock),
      latestBlock: Number(latestBlock),
      purchasesIndexed: rows.length,
      caughtUp: toBlock >= latestBlock,
    });
  } catch (err) {
    console.error("index-sale-events failed:", err);
    return jsonResponse({ error: "Indexing run failed", detail: String(err) }, 500);
  }
}

Deno.serve(handleRequest);
