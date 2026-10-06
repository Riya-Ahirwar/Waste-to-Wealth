-- ==========================================================
-- WASTE TO WEALTH - SUPABASE SCHEMA FOR CLOUD PROFILE SYNC
-- ==========================================================
-- Paste this script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

create table if not exists public.saved_crafts (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  image text,
  status text default 'Planned',
  materials jsonb default '[]'::jsonb,
  time_minutes int,
  difficulty text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.saved_crafts enable row level security;

-- Policies: Users manage only their own crafts
create policy "Users can view their own crafts" on public.saved_crafts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own crafts" on public.saved_crafts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own crafts" on public.saved_crafts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own crafts" on public.saved_crafts
  for delete using (auth.uid() = user_id);
