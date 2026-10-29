-- Page-visit counting for the admin panel (see AdminVisits.tsx). Written by
-- the track-visit Edge Function (fired once per page load from
-- VisitTracker.tsx), read by the visit-stats Edge Function. No client/path
-- data beyond what's needed for a count -- no IP, no user agent, no
-- per-visitor identity.

create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists page_visits_created_at_idx on public.page_visits (created_at desc);

-- RLS enabled with no policies -- same pattern as bot_conversations /
-- sale_purchases: only the Edge Functions' service-role key can read or
-- write this table.
alter table public.page_visits enable row level security;
