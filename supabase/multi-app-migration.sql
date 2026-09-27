-- Multi-app migration for the existing みんなのAIガチャ図鑑 database.
-- This is already applied to the production Supabase project used for this app.
-- Keep this file as a reproducible record for new environments.

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null default '',
  description text not null default '',
  logo_url text not null default '',
  background_url text not null default '',
  primary_color text not null default '#111827',
  item_name text not null default '作品',
  item_name_plural text not null default '作品',
  show_x_account boolean not null default true,
  show_creator boolean not null default true,
  show_number boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.apps (slug, name, subtitle, background_url)
select 'ai-gacha', title, subtitle, background_url
from public.site_settings
where id = 1
on conflict (slug) do nothing;

alter table public.gachas add column if not exists app_id uuid;
alter table public.site_settings add column if not exists app_id uuid;

update public.gachas
set app_id = (select id from public.apps where slug = 'ai-gacha')
where app_id is null;

update public.site_settings
set app_id = (select id from public.apps where slug = 'ai-gacha')
where app_id is null;

alter table public.gachas alter column app_id set not null;
alter table public.site_settings alter column app_id set not null;

alter table public.gachas drop constraint if exists gachas_display_no_key;
create unique index if not exists gachas_app_display_no_key on public.gachas(app_id, display_no);
create index if not exists gachas_app_id_idx on public.gachas(app_id);
create index if not exists apps_slug_idx on public.apps(slug);

alter table public.gachas drop constraint if exists gachas_app_id_fkey;
alter table public.gachas add constraint gachas_app_id_fkey foreign key (app_id) references public.apps(id) on delete cascade;

alter table public.site_settings drop constraint if exists site_settings_app_id_fkey;
alter table public.site_settings add constraint site_settings_app_id_fkey foreign key (app_id) references public.apps(id) on delete cascade;

alter table public.site_settings drop constraint if exists site_settings_app_id_key;
create unique index if not exists site_settings_app_id_key on public.site_settings(app_id);

alter table public.apps enable row level security;
alter table public.gachas enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "apps_public_read" on public.apps;
create policy "apps_public_read" on public.apps for select to anon, authenticated using (is_public = true);

drop policy if exists "gachas_public_read" on public.gachas;
create policy "gachas_public_read" on public.gachas for select to anon, authenticated using (
  exists (select 1 from public.apps a where a.id = gachas.app_id and a.is_public = true)
);

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings for select to anon, authenticated using (
  exists (select 1 from public.apps a where a.id = site_settings.app_id and a.is_public = true)
);

grant select on public.apps to anon, authenticated;
grant select on public.gachas to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
