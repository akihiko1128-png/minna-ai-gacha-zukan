-- みんなのAIガチャ図鑑 / Supabase 初期設定
create extension if not exists pgcrypto;

create table if not exists public.gachas (
  id uuid primary key default gen_random_uuid(),
  display_no integer not null unique,
  title text not null default '',
  author text not null default '',
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gachas enable row level security;

-- アプリはサーバー側の Supabase Secret Key だけでDBへアクセスします。
-- そのため匿名ユーザー用のDB読み取り権限は付与しません。

insert into storage.buckets (id, name, public)
values ('gacha-images', 'gacha-images', true)
on conflict (id) do update set public = true;