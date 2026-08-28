-- Meu Treino — Supabase
-- Execute este SQL uma única vez no SQL Editor do seu projeto Supabase.

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_key text not null,
  day text not null,
  workout_date date not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, log_key)
);

alter table public.workout_logs enable row level security;

drop policy if exists "Users can read their own workouts" on public.workout_logs;
drop policy if exists "Users can insert their own workouts" on public.workout_logs;
drop policy if exists "Users can update their own workouts" on public.workout_logs;
drop policy if exists "Users can delete their own workouts" on public.workout_logs;

create policy "Users can read their own workouts" on public.workout_logs for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own workouts" on public.workout_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own workouts" on public.workout_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own workouts" on public.workout_logs for delete to authenticated using (auth.uid() = user_id);

create index if not exists workout_logs_user_date_idx on public.workout_logs(user_id, workout_date desc);
