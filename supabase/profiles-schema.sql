-- Profiles linked to auth.users — run in Supabase SQL editor after core schema.
-- Requires: Authentication → Providers → Email enabled (password sign-in).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text,
  display_name text,
  avatar_url text,
  username text,
  onboarding_completed boolean not null default false,
  home_city text,
  preferred_radius integer,
  role text not null default 'user'
);

-- Existing projects: add column if you created profiles before avatar_url existed.
alter table public.profiles add column if not exists avatar_url text;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null and length(trim(username)) > 0;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile when a new auth user is registered (email, OAuth, etc.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )), ''),
    nullif(trim(coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing auth users (run once if you already have users)
insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  u.email,
  nullif(trim(coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )), ''),
  nullif(trim(coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Backfill avatar_url for profiles missing it (e.g. Google sign-ups before this column).
update public.profiles p
set avatar_url = nullif(trim(coalesce(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture'
)), '')
from auth.users u
where p.id = u.id
  and (p.avatar_url is null or trim(p.avatar_url) = '')
  and coalesce(
    nullif(trim(u.raw_user_meta_data->>'avatar_url'), ''),
    nullif(trim(u.raw_user_meta_data->>'picture'), '')
  ) is not null;
