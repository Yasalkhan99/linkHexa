-- Run this in your Supabase project's SQL Editor if you get "Could not find the table 'public.profiles'".
-- Use the project that matches your .env.local (NEXT_PUBLIC_SUPABASE_URL).

-- Table for website signup: linked to Supabase Auth (auth.users).
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text not null,
  role text not null check (role in ('publisher', 'advertiser')),
  email text not null,
  company_name text,
  website text,
  company_description text,
  payment_email text,
  tax_id text,
  address text,
  city text,
  country text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id),
  unique (username)
);

alter table public.profiles enable row level security;

-- Drop existing policies if re-running (optional)
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

comment on table public.profiles is 'Website signup profiles; id = auth.users.id. Password is in Auth only.';

-- Trigger: create profile row when a new user signs up (so Admin Dashboard shows signups).
drop policy if exists "Allow auth trigger to insert profile" on public.profiles;
create policy "Allow auth trigger to insert profile"
  on public.profiles for insert
  to supabase_auth_admin
  with check (true);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  insert into public.profiles (
    id, username, role, email,
    company_name, website, company_description,
    payment_email, tax_id, address, city, country,
    approval_status
  ) values (
    new.id,
    coalesce(nullif(trim(meta->>'username'), ''), 'user'),
    coalesce(nullif(meta->>'role', ''), 'publisher'),
    coalesce(new.email, ''),
    nullif(trim(meta->>'company_name'), ''),
    nullif(trim(meta->>'website'), ''),
    nullif(trim(meta->>'company_description'), ''),
    nullif(trim(meta->>'payment_email'), ''),
    nullif(trim(meta->>'tax_id'), ''),
    nullif(trim(meta->>'address'), ''),
    nullif(trim(meta->>'city'), ''),
    nullif(trim(meta->>'country'), ''),
    'pending'
  );
  return new;
exception when others then
  return new;
end;
$$;

grant execute on function public.handle_new_user_profile() to supabase_auth_admin;
revoke execute on function public.handle_new_user_profile() from authenticated, anon, public;

drop trigger if exists on_auth_user_created_profiles on auth.users;
create trigger on_auth_user_created_profiles
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();
