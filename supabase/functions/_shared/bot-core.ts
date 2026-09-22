// AgenticCore Token — shared front-desk bot logic, used by the homepage
// widget, Forge (the dashboard's own assistant), and the Telegram bot.
// Channel-agnostic on purpose: takes plain text in, returns plain text
// out, knows nothing about HTTP requests or Telegram updates.
//
// Wired to Claude directly (Anthropic's own SDK), not OpenRouter/xAI like
// the sibling AgenticCore sites -- this project has no email/password auth
// at all, so externalId is a wallet address (widget/forge) or a Telegram
// chat id (telegram), never a Supabase Auth user id.

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.127.0";
// zodOutputFormat() is built against zod's v4 API internally (it imports
// "zod/v4" and reads schema.def, a v4-only property -- v3 schemas only have
// _def). The explicit `z` import below must therefore also be zod v4 --
// building ReplySchema with a v3 `z.object()` left `.def` undefined and
// zodOutputFormat() threw "Cannot read properties of undefined (reading
// 'def')" on every single call, silently breaking all three assistants
// behind the generic error-message fallback (every request still returned
// HTTP 200, so it never showed up as a server error).
import { zodOutputFormat } from "https://esm.sh/@anthropic-ai/sdk@0.127.0/helpers/zod";
import { z } from "https://esm.sh/zod@4.6.5";
import { BUSINESS_KNOWLEDGE_PROMPT } from "./business-knowledge.ts";

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;

export type Channel = "widget" | "telegram" | "forge";

export interface BotConversation {
  id: string;
  channel: Channel;
  external_id: string;
  language: string | null;
  needs_human: boolean;
  created_at: string;
  updated_at: string;
}

export interface BotMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface HandleMessageParams {
  supabaseAdmin: SupabaseAdmin;
  channel: Channel;
  externalId: string;
  userMessage: string;
  anthropicApiKey: string;
  model?: string;
  // Platform hint (Telegram's language_code, or the browser's
  // navigator.language) -- not a default, just an extra signal.
  languageHint?: string;
  // When both are present, a needs_human escalation proactively DMs the
  // owner via this bot's own Telegram API, regardless of which channel
  // the conversation came from.
  telegramBotToken?: string;
  ownerTelegramId?: string;
}

export interface HandleMessageResult {
  reply: string;
  needsHuman: boolean;
  rateLimited?: boolean;
}

const DEFAULT_MODEL = "claude-opus-5";
const HISTORY_LIMIT = 30;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_USER_MESSAGES = 20;

const RATE_LIMIT_MESSAGE =
  "You're sending messages a bit too quickly — please wait a few minutes and try again.";
const GENERIC_ERROR_MESSAGE =
  "Something went wrong on our end. Please try again in a moment.";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

const ReplySchema = z.object({
  reply: z.string().describe("The reply to send, written entirely in the sender's own language."),
  detected_language: z.string().describe("ISO 639-1 code (or best-guess language name) of the language the sender wrote in."),
  needs_human: z
    .boolean()
    .describe(
      "True if this conversation should be handed off to a human -- a real problem (lost funds, security concern, suspected scam), something materially outside the given knowledge, or clear frustration."
    ),
  uncertain: z
    .boolean()
    .describe("True if the assistant is not confident in the reply, or the question falls outside the given business knowledge."),
  escalation_summary: z
    .string()
    .describe("Concise summary for a human when needs_human is true, capturing what the person needs. Empty string otherwise."),
});

type ParsedReply = z.infer<typeof ReplySchema>;

export async function findOrCreateConversation(
  supabaseAdmin: SupabaseAdmin,
  channel: Channel,
  externalId: string
): Promise<BotConversation> {
  const { data: existing } = await supabaseAdmin
    .from("bot_conversations")
    .select("*")
    .eq("channel", channel)
    .eq("external_id", externalId)
    .maybeSingle();

  if (existing) return existing as BotConversation;

  const { data: created, error } = await supabaseAdmin
    .from("bot_conversations")
    .insert({ channel, external_id: externalId })
    .select("*")
    .single();

  if (error) throw error;
  return created as BotConversation;
}

export async function getRecentMessages(
  supabaseAdmin: SupabaseAdmin,
  conversationId: string,
  limit = HISTORY_LIMIT
): Promise<BotMessage[]> {
  const { data } = await supabaseAdmin
    .from("bot_messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data as BotMessage[]) || []).reverse();
}

export async function getConversationHistory(
  supabaseAdmin: SupabaseAdmin,
  channel: Channel,
  externalId: string,
  limit = HISTORY_LIMIT
): Promise<BotMessage[]> {
  const { data: conversation } = await supabaseAdmin
    .from("bot_conversations")
    .select("id")
    .eq("channel", channel)
    .eq("external_id", externalId)
    .maybeSingle();

  if (!conversation) return [];
  return getRecentMessages(supabaseAdmin, conversation.id, limit);
}

async function isRateLimited(supabaseAdmin: SupabaseAdmin, conversationId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("bot_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("role", "user")
    .gte("created_at", windowStart);

  return (count || 0) >= RATE_LIMIT_MAX_USER_MESSAGES;
}

async function callClaude(
  apiKey: string,
  model: string,
  system: string,
  history: BotMessage[],
  userMessage: string
): Promise<ParsedReply> {
  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await client.messages.parse({
    model,
    max_tokens: 4096,
    system,
    messages,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(ReplySchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude response missing parsed_output");
  }
  return response.parsed_output;
}

// Proactively DMs the account owner via the bot's own Telegram API the
// moment a needs_human escalation fires, regardless of which channel it
// came from. Best-effort: a failure here must not break the reply the
// visitor already got.
async function notifyOwnerOfEscalation(
  telegramBotToken: string,
  ownerTelegramId: string,
  channel: Channel,
  summary: string
): Promise<void> {
  try {
    const resp = await fetch(`${TELEGRAM_API_BASE}${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(ownerTelegramId),
        text: `AC assistant escalation (${channel}):\n\n${summary}`,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error(`notifyOwnerOfEscalation: sendMessage failed (${resp.status}):`, text.slice(0, 500));
    }
  } catch (err) {
    console.error("notifyOwnerOfEscalation failed:", err);
  }
}

export async function handleIncomingMessage(params: HandleMessageParams): Promise<HandleMessageResult> {
  const { supabaseAdmin, channel, externalId, userMessage, anthropicApiKey, model, languageHint, telegramBotToken, ownerTelegramId } =
    params;

  const conversation = await findOrCreateConversation(supabaseAdmin, channel, externalId);

  if (await isRateLimited(supabaseAdmin, conversation.id)) {
    return { reply: RATE_LIMIT_MESSAGE, needsHuman: false, rateLimited: true };
  }

  const history = await getRecentMessages(supabaseAdmin, conversation.id);

  let systemPrompt = BUSINESS_KNOWLEDGE_PROMPT;
  if (languageHint) {
    systemPrompt += `\n\n(Platform hint, not a rule: this person's device/client language looks like "${languageHint}". Use it only if their own message gives you no better signal -- their actual words always win.)`;
  }
  if (channel === "forge") {
    systemPrompt += `\n\nYou're embedded directly in the connected wallet's own dashboard (not the public homepage or Telegram) -- whoever is writing has already connected a wallet, so speak to them as an existing dashboard user, not a first-time visitor. If the conversation history above is empty, this is the first thing they've said here: open with a short welcome and invite their question about the dashboard, referral program, or VIP Pool.`;
  }

  let parsed: ParsedReply;
  try {
    parsed = await callClaude(anthropicApiKey, model || DEFAULT_MODEL, systemPrompt, history, userMessage);
  } catch (err) {
    console.error("Claude call failed:", err);
    return { reply: GENERIC_ERROR_MESSAGE, needsHuman: false };
  }

  const { reply, detected_language: detectedLanguage, needs_human: needsHuman, uncertain, escalation_summary: escalationSummary } =
    parsed;

  if (needsHuman && escalationSummary && telegramBotToken && ownerTelegramId) {
    await notifyOwnerOfEscalation(telegramBotToken, ownerTelegramId, channel, escalationSummary);
  }

  await supabaseAdmin.from("bot_messages").insert([
    {
      conversation_id: conversation.id,
      role: "user",
      content: userMessage,
      detected_language: detectedLanguage || null,
    },
    {
      conversation_id: conversation.id,
      role: "assistant",
      content: reply,
      detected_language: detectedLanguage || null,
      uncertain,
      handoff_triggered: needsHuman,
    },
  ]);

  await supabaseAdmin
    .from("bot_conversations")
    .update({
      language: detectedLanguage || conversation.language,
      needs_human: conversation.needs_human || needsHuman,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  return { reply, needsHuman };
}
