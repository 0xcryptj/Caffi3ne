-- User location history (device / manual pings). Run in Supabase SQL Editor after `profiles-schema.sql`.
-- RLS: each user can read and insert only their own rows. Use the service role or a future admin
-- policy if you need a staff dashboard over all locations.

create table if not exists public.user_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters double precision,
  altitude_meters double precision,
  heading_degrees double precision,
  speed_meters_per_second double precision,
  -- device = GPS; manual = user-picked; ip = server IP geolocation; general = ZIP/city search center
  source text not null default 'device'
    check (source in ('device', 'manual', 'ip', 'general')),
  -- Optional: when the client believes the fix was taken (vs created_at = insert time)
  client_recorded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_locations_user_id_created_at_idx
  on public.user_locations (user_id, created_at desc);

comment on table public.user_locations is 'Append-only location samples per auth user for maps, nearby features, and analytics.';

alter table public.user_locations enable row level security;

drop policy if exists "user_locations_select_own" on public.user_locations;
drop policy if exists "user_locations_insert_own" on public.user_locations;

create policy "user_locations_select_own"
  on public.user_locations for select
  using (auth.uid() = user_id);

create policy "user_locations_insert_own"
  on public.user_locations for insert
  with check (auth.uid() = user_id);

-- No update/delete by default (immutable log). Add policies later if users should delete history.
