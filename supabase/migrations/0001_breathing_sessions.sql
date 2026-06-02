-- Breathing session history (one row per completed session).
-- Run in Supabase SQL Editor or via supabase db push.

create table if not exists public.breathing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  performed_at timestamptz not null,
  created_at timestamptz not null default now(),
  rounds int not null,
  breaths_per_round int not null,
  inhale_seconds numeric not null,
  exhale_seconds numeric not null,
  recovery_seconds numeric not null,
  retention_log int[] not null default '{}',
  duration_seconds int not null
);

create index if not exists breathing_sessions_user_performed_idx
  on public.breathing_sessions (user_id, performed_at desc);

alter table public.breathing_sessions enable row level security;

create policy "Users can view own sessions"
  on public.breathing_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.breathing_sessions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.breathing_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.breathing_sessions
  for delete
  using (auth.uid() = user_id);
