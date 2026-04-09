-- Run once if `user_locations` already exists without `general` in the source check.
alter table public.user_locations drop constraint if exists user_locations_source_check;
alter table public.user_locations add constraint user_locations_source_check
  check (source in ('device', 'manual', 'ip', 'general'));
