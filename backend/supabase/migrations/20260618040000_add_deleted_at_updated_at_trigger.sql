-- Add soft-delete support and fix updated_at so it actually updates on every write.

alter table public.profiles
  add column deleted_at timestamptz;

-- Trigger function: stamp updated_at to now() on every UPDATE.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Soft-deleted profiles must not be visible to the RLS select policies.
-- We drop and recreate the existing view-own-profile policy to exclude deleted rows.
drop policy if exists "Users can view own profile" on profiles;

create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id and deleted_at is null);
