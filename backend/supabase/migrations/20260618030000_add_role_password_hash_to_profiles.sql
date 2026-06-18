-- Add server-authoritative role and bcrypt password_hash to profiles.
-- Role is no longer trusted from JWT user_metadata alone — the DB is the source of truth.
-- password_hash is set by the backend register endpoint (bcrypt, cost 12).

alter table public.profiles
  add column role user_role not null default 'student',
  add column password_hash varchar(255);

-- Replace the trigger so it also writes role from signup metadata.
-- Falls back to 'student' if no role is provided (safe default).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(trim(new.raw_user_meta_data->>'full_name'), ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')::user_role
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
