// AgenticCore Token — Telegram bot webhook. Registered as the bot's
// webhook URL via Telegram's setWebhook API. Every message routes through
// handleIncomingMessage() in ../_shared/bot-core.ts on the 'telegram'
// channel. Unlike the sibling AgenticCore sites' telegram-webhook, there is
// no owner task-management layer here (no manager_tasks / pricing-catalog
// concept for a token project) -- just the front-desk assistant, with
// escalations DM'd to the owner via bot-core.ts's own notifyOwnerOfEscalation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleIncomingMessage } from "../_shared/bot-core.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") || undefined;
// Telegram's numeric user id for the account owner, as a string -- gates
// nothing here directly, just tells bot-core.ts where to DM an escalation.
const OWNER_TELEGRAM_ID = Deno.env.get("OWNER_TELEGRAM_ID") || undefined;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
// Telegram's hard limit is 4096 chars; this is just a safety margin.
const MAX_TELEGRAM_MESSAGE_LENGTH = 4000;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const truncated =
    text.length > MAX_TELEGRAM_MESSAGE_LENGTH ? text.slice(0, MAX_TELEGRAM_MESSAGE_LENGTH) + "…" : text;

  const resp = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: truncated }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    console.error(`Telegram sendMessage failed (${resp.status}):`, body);
  }
}

// Exported separately from Deno.serve() so it can be exercised directly in
// tests without a real Deno HTTP server.
export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Only accept requests carrying the secret Telegram was configured (via
  // setWebhook's secret_token) to send on every call.
  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (secretHeader !== TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  // Always ack 200 for anything deliberately not handled (edited messages,
  // photos/stickers with no text, channel posts, etc.) -- a non-2xx here
  // makes Telegram retry the same update repeatedly.
  if (!chatId || typeof text !== "string" || text.trim() === "") {
    return new Response("ok");
  }

  const languageHint: string | undefined = message?.from?.language_code || undefined;

  try {
    const result = await handleIncomingMessage({
      supabaseAdmin,
      channel: "telegram",
      externalId: String(chatId),
      userMessage: text,
      anthropicApiKey: ANTHROPIC_API_KEY,
      model: ANTHROPIC_MODEL,
      languageHint,
      telegramBotToken: TELEGRAM_BOT_TOKEN,
      ownerTelegramId: OWNER_TELEGRAM_ID,
    });

    await sendTelegramMessage(chatId, result.reply);
  } catch (err) {
    console.error("telegram-webhook: unhandled error", err);
    await sendTelegramMessage(chatId, "Something went wrong on our end. Please try again in a moment.").catch(() => {});
  }

  return new Response("ok");
}

Deno.serve(handleRequest);
