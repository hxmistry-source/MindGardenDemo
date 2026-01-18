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
  friend_code text,
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

create table if not exists public.actions_catalog (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  label text not null,
  prompt text not null,
  category text not null,
  is_core boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action_type text not null,
  action_kind text not null,
  category text not null,
  mood_score integer,
  text_input text,
  action_variant text,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_garden (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp_total integer default 0,
  garden_level integer default 1,
  water integer default 0,
  sunlight integer default 0,
  soil integer default 0,
  bloom integer default 0,
  background_id text,
  decor_ids text[],
  plant_skin text,
  preferred_categories text[],
  last_swap_date date,
  daily_core_action_type text,
  daily_core_action_variant text,
  daily_core_action_date date,
  daily_bonus_action_types text[],
  daily_bonus_action_date date
);

create table if not exists public.unlockables (
  id uuid primary key default gen_random_uuid(),
  unlock_type text not null,
  label text not null,
  description text,
  requirement_type text not null,
  requirement_value integer not null,
  payload jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.user_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  unlockable_id uuid references public.unlockables(id) on delete cascade,
  unlocked_at timestamp with time zone default now()
);

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  friend_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists public.friend_gestures (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  gesture_type text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
alter table public.actions enable row level security;
alter table public.actions_catalog enable row level security;
alter table public.user_actions enable row level security;
alter table public.user_garden enable row level security;
alter table public.unlockables enable row level security;
alter table public.user_unlocks enable row level security;
alter table public.friends enable row level security;
alter table public.friend_gestures enable row level security;

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

create policy "Users can lookup friend codes"
  on public.profiles
  for select
  using (friend_code is not null);

create policy "Users can view their actions"
  on public.actions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their actions"
  on public.actions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view catalog"
  on public.actions_catalog
  for select
  using (true);

create policy "Users can view their user actions"
  on public.user_actions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their user actions"
  on public.user_actions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their garden"
  on public.user_garden
  for select
  using (auth.uid() = user_id);

create policy "Users can upsert their garden"
  on public.user_garden
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their garden"
  on public.user_garden
  for update
  using (auth.uid() = user_id);

create policy "Users can view unlockables"
  on public.unlockables
  for select
  using (true);

create policy "Users can view their unlocks"
  on public.user_unlocks
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their unlocks"
  on public.user_unlocks
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their friends"
  on public.friends
  for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can insert their friends"
  on public.friends
  for insert
  with check (auth.uid() = user_id);

create policy "Users can view their gestures"
  on public.friend_gestures
  for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert their gestures"
  on public.friend_gestures
  for insert
  with check (auth.uid() = sender_id);

create or replace function public.increment_friend_nutrient(
  target_user_id uuid,
  nutrient_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_garden
  set
    water = case when nutrient_key = 'water' then water + 1 else water end,
    sunlight = case when nutrient_key = 'sunlight' then sunlight + 1 else sunlight end,
    soil = case when nutrient_key = 'soil' then soil + 1 else soil end,
    bloom = case when nutrient_key = 'bloom' then bloom + 1 else bloom end
  where user_id = target_user_id;
end;
$$;

grant execute on function public.increment_friend_nutrient(uuid, text) to authenticated;
