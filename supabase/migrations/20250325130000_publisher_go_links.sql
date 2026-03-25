-- Short tracking-style links for publishers (e.g. /go/short/{slug} → merchant URL).
--
-- If you see: "Could not find the table 'public.publisher_go_links' in the schema cache"
-- run this entire file once in: Supabase Dashboard → SQL Editor → New query → Run.
-- Requires public.awin_programmes and public.profiles to exist first.

create table if not exists public.publisher_go_links (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  publisher_id uuid not null references public.profiles (id) on delete cascade,
  programme_id bigint not null references public.awin_programmes (programme_id) on delete cascade,
  target_url text not null,
  deep_link boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (id),
  constraint publisher_go_links_slug_len check (char_length(slug) >= 6 and char_length(slug) <= 32),
  constraint publisher_go_links_slug_unique unique (slug)
);

create index if not exists publisher_go_links_publisher_programme_idx
  on public.publisher_go_links (publisher_id, programme_id, created_at desc);

alter table public.publisher_go_links enable row level security;

comment on table public.publisher_go_links is 'Publisher short links; redirect resolved server-side by slug.';

-- Refresh PostgREST schema cache so the API sees the new table immediately.
notify pgrst, 'reload schema';
