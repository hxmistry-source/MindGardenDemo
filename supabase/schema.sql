-- Enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  created_at timestamp with time zone default now(),
  reminder_time text,
  timezone text,
  current_seed_type text,
  seed_variant text,
  current_stage integer default 0,
  streak_count integer default 0,
  last_action_date date,
  grace_used_at timestamp with time zone
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action_type text not null,
  mood_score integer,
  text_input text,
  action_variant text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
alter table public.actions enable row level security;

create policy "Users can view their profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can upsert their profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can view their actions"
  on public.actions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their actions"
  on public.actions
  for insert
  with check (auth.uid() = user_id);
