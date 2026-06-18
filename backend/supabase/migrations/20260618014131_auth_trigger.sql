-- Whenever a new user signs up via Supabase Auth, this trigger automatically creates a matching
-- row in public.profiles using their auth ID, email, and full name from signup metadata!
-- security definer ensures that the insert into runs with owner privileges since the 
-- new user which we are trynna create won't have that level of privileges yet

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(trim(new.raw_user_meta_data->>'full_name'), ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();