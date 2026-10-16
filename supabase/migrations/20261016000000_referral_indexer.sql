-- Real referral-tree indexer: stores every on-chain Purchase event from the
-- Sale contract so the dashboard can show a wallet's actual downline instead
-- of the illustrative mock tree (see src/lib/mockReferralData.ts and
-- DemoModeBanner.tsx). Populated by the index-sale-events Edge Function;
-- read by the referral-tree Edge Function.

create table if not exists public.indexer_state (
  id smallint primary key default 1,
  last_indexed_block bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint indexer_state_singleton check (id = 1)
);

create table if not exists public.sale_purchases (
  id bigserial primary key,
  tx_hash text not null,
  log_index int not null,
  block_number bigint not null,
  -- Best-effort; null when the indexer skipped the extra getBlock() call.
  -- Falls back to created_at (indexing time) for "joined X days ago".
  block_timestamp timestamptz,
  buyer_address text not null,
  referrer_address text not null,
  usdt_amount numeric not null,
  ac_amount numeric not null,
  referred boolean not null,
  created_at timestamptz not null default now(),
  unique (tx_hash, log_index)
);

create index if not exists sale_purchases_referrer_idx on public.sale_purchases (referrer_address);
create index if not exists sale_purchases_buyer_idx on public.sale_purchases (buyer_address);

-- RLS enabled with no policies -- same pattern as bot_conversations /
-- dashboard_cards: only the Edge Functions' service-role key can read or
-- write these tables.
alter table public.indexer_state enable row level security;
alter table public.sale_purchases enable row level security;
