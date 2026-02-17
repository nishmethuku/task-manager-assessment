-- Supabase schema for the task manager assessment
--
-- This script creates a `tasks` table, enables row level security and
-- defines policies that ensure each user can only interact with their own
-- tasks.  Run this file in the Supabase SQL editor.

-- Enable the pgcrypto extension if not already enabled.  This provides
-- the `gen_random_uuid()` function used for primary keys.
create extension if not exists "pgcrypto";

-- Create the tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  description text,
  priority text check (priority in ('low','normal','high')) default 'normal',
  due_date date
);

-- Enable Row Level Security on the tasks table
alter table public.tasks enable row level security;

-- Allow users to select only their own tasks
create policy "select_own_tasks"
  on public.tasks
  for select
  using (auth.uid() = user_id);

-- Allow users to insert tasks with their own user_id
create policy "insert_own_tasks"
  on public.tasks
  for insert
  with check (auth.uid() = user_id);

-- Allow users to update only their own tasks
create policy "update_own_tasks"
  on public.tasks
  for update
  using (auth.uid() = user_id);

-- Optional: allow users to delete only their own tasks
create policy "delete_own_tasks"
  on public.tasks
  for delete
  using (auth.uid() = user_id);
