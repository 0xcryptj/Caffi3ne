create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text,
  role text not null default 'consumer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  rating numeric(2,1),
  user_ratings_total integer,
  website text,
  phone text,
  hours_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shops_google_place_id_idx on public.shops (google_place_id);
create index if not exists shops_lat_lng_idx on public.shops (lat, lng);

create table if not exists public.shop_snapshots (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  weather_score integer not null,
  traffic_score integer not null,
  time_score integer not null,
  event_score integer not null default 0,
  estimated_busyness_score integer not null,
  estimated_busyness_label text not null,
  raw_inputs_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists shop_snapshots_shop_id_created_at_idx
  on public.shop_snapshots (shop_id, created_at desc);

create table if not exists public.merchant_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_name text not null,
  submitted_address text not null,
  lat double precision,
  lng double precision,
  website text,
  contact_email text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.shop_claims (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  claim_email text not null,
  evidence_json jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_claims_shop_id_idx on public.shop_claims (shop_id);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  tier text not null default 'free',
  is_active boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_user_id_idx on public.api_keys (user_id);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references public.api_keys(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  endpoint text not null,
  request_count integer not null default 1,
  response_status integer not null,
  latency_ms integer,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_api_key_id_created_at_idx
  on public.usage_events (api_key_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_shops_updated_at on public.shops;
create trigger set_shops_updated_at
before update on public.shops
for each row
execute function public.set_updated_at();

drop trigger if exists set_shop_claims_updated_at on public.shop_claims;
create trigger set_shop_claims_updated_at
before update on public.shop_claims
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.shops enable row level security;
alter table public.shop_snapshots enable row level security;
alter table public.merchant_submissions enable row level security;
alter table public.shop_claims enable row level security;
alter table public.api_keys enable row level security;
alter table public.usage_events enable row level security;

-- TODO: Add explicit RLS policies after auth roles and merchant access flows are finalized.
