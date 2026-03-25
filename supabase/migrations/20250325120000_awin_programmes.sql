-- Awin programme cache (synced from Awin Publisher API) and publisher applications.
-- Access via Next.js API routes using SUPABASE_SERVICE_ROLE_KEY only.

create table if not exists public.awin_programmes (
  programme_id bigint not null,
  name text not null,
  description text,
  display_url text,
  logo_url text,
  click_through_url text,
  currency_code text,
  programme_status text,
  primary_region jsonb,
  synced_at timestamptz not null default now(),
  primary key (programme_id)
);

create index if not exists awin_programmes_synced_at_idx on public.awin_programmes (synced_at desc);

create table if not exists public.publisher_awin_applications (
  id uuid not null default gen_random_uuid(),
  publisher_id uuid not null references public.profiles (id) on delete cascade,
  programme_id bigint not null references public.awin_programmes (programme_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id),
  unique (publisher_id, programme_id)
);

create index if not exists publisher_awin_applications_status_idx
  on public.publisher_awin_applications (status);

create index if not exists publisher_awin_applications_publisher_idx
  on public.publisher_awin_applications (publisher_id);

alter table public.awin_programmes enable row level security;
alter table public.publisher_awin_applications enable row level security;

comment on table public.awin_programmes is 'Cached Awin advertiser programmes; populated by admin sync.';
comment on table public.publisher_awin_applications is 'Publisher requests to promote an Awin programme; admin approves/rejects.';
