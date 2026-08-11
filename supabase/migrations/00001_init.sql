-- ============================================================================
-- rtsp.me — Supabase schema
-- Applies to BOTH the local stack (`supabase start` runs this automatically)
-- and the cloud project (paste into SQL Editor, or `supabase db push`).
-- Safe to run once; not designed to be re-run blindly (policies etc.).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- Broadcasts owned by a user (dashboard + public embed pages)
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  rtsp_url text not null,
  hls_url text,
  description text,
  status text not null default 'offline' check (status in ('online', 'offline')),
  views bigint not null default 0,
  public_id text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists broadcasts_public_id_key on public.broadcasts (public_id);
create index if not exists broadcasts_user_id_idx on public.broadcasts (user_id);

-- Contact messages from the landing page (public insert only)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  body text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Public read model for embed pages
-- Exposes only what the public player needs — RTSP URLs and owner ids stay
-- private (the landing page promises "your links stay private").
-- ----------------------------------------------------------------------------
create or replace view public.public_broadcasts as
select
  id,
  public_id,
  name,
  description,
  status,
  views,
  hls_url,
  created_at
from public.broadcasts;

-- ----------------------------------------------------------------------------
-- View counter for the public player
-- `security definer` so an unauthenticated visitor can bump the counter
-- without touching the RLS-protected table directly.
-- ----------------------------------------------------------------------------
create or replace function public.increment_broadcast_view(p_public_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.broadcasts
  set views = views + 1
  where public_id = p_public_id and status = 'online';
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.broadcasts enable row level security;
alter table public.messages enable row level security;

-- Users manage only their own broadcasts.
create policy "broadcasts_owner_select" on public.broadcasts
  for select to authenticated using (auth.uid() = user_id);
create policy "broadcasts_owner_insert" on public.broadcasts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "broadcasts_owner_update" on public.broadcasts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "broadcasts_owner_delete" on public.broadcasts
  for delete to authenticated using (auth.uid() = user_id);

-- Anyone (signed in or not) can submit a contact message; no public read path.
create policy "messages_public_insert" on public.messages
  for insert to anon, authenticated with check (true);

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.broadcasts to authenticated;
grant select, insert on table public.messages to anon, authenticated;
grant select on table public.public_broadcasts to anon, authenticated;
grant execute on function public.increment_broadcast_view(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Realtime — the dashboard refreshes live when broadcasts change
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'broadcasts'
  ) then
    alter publication supabase_realtime add table public.broadcasts;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Demo account
-- demo@rtsp.me / demo123456 — pre-confirmed so sign-in works immediately.
-- If `auth.admin_create_user` is unavailable on your project, create the user
-- manually: Authentication > Users > Add user (with a password), then run the
-- sample-broadcast inserts below with that user's id.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from auth.users where email = 'demo@rtsp.me') then
    perform auth.admin_create_user(
      'b23e9b7e-2f3d-4c7a-9a5e-0c1d2e3f4a5b'::uuid, -- user_id
      'demo@rtsp.me',                                 -- email
      null,                                           -- phone
      'demo123456',                                   -- password
      true,                                           -- email_confirm
      false                                           -- phone_confirm
    );
  end if;
end $$;

-- Sample broadcasts for the demo account (idempotent)
insert into public.broadcasts
  (user_id, name, rtsp_url, hls_url, description, status, views, public_id)
values
  (
    'b23e9b7e-2f3d-4c7a-9a5e-0c1d2e3f4a5b'::uuid,
    'Warehouse entrance',
    'rtsp://admin:demo@8.8.8.8:554/Streaming/Channels/101',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'Demo stream — plays a real public HLS feed so you can test the player.',
    'online',
    12847,
    'WHSE1A'
  ),
  (
    'b23e9b7e-2f3d-4c7a-9a5e-0c1d2e3f4a5b'::uuid,
    'Parking lot',
    'rtsp://admin:demo@8.8.8.8:554/cam/realmonitor?channel=1&subtype=0',
    null,
    null,
    'offline',
    3412,
    'PRKLOT'
  ),
  (
    'b23e9b7e-2f3d-4c7a-9a5e-0c1d2e3f4a5b'::uuid,
    'Front desk',
    'rtsp://admin:demo@8.8.8.8:9784/cameras/0/streaming/main?audio=1',
    null,
    null,
    'offline',
    976,
    'FRNTDSK'
  )
on conflict (public_id) do nothing;
