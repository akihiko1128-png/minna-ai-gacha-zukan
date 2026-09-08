-- みんなのAIガチャ図鑑 / Supabase
create extension if not exists pgcrypto;

create table if not exists public.gachas (
  id uuid primary key default gen_random_uuid(),
  display_no integer not null unique,
  title text not null default '',
  author text not null default '',
  author_x text not null default '',
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gachas enable row level security;
alter table public.gachas add column if not exists author_x text not null default '';

create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  title text not null default 'みんなのAIガチャ図鑑',
  subtitle text not null default 'AIで作ったカプセルトイ作品を集めました',
  background_url text not null default '',
  background_path text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gacha-images', 'gacha-images', true)
on conflict (id) do update set public = true;
