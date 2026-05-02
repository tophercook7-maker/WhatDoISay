create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text default 'free',
  default_tone text default 'auto',
  save_history boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  text_replies_used integer default 0,
  voice_replies_used integer default 0,
  credits_used integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, usage_date)
);

create table if not exists public.reply_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  input_type text default 'text',
  user_input text,
  pasted_message text,
  mode text,
  generated_reply text not null,
  action_type text default 'generate',
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text,
  status text default 'none',
  plan text default 'free',
  renewal_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists usage_daily_set_updated_at on public.usage_daily;
create trigger usage_daily_set_updated_at
before update on public.usage_daily
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  insert into public.subscriptions (user_id, provider, status, plan)
  values (new.id, null, 'none', 'free')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.usage_daily enable row level security;
alter table public.reply_history enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users can select their own profile" on public.profiles;
create policy "Users can select their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can select their own usage rows" on public.usage_daily;
create policy "Users can select their own usage rows"
on public.usage_daily
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own usage rows" on public.usage_daily;
create policy "Users can insert their own usage rows"
on public.usage_daily
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own usage rows" on public.usage_daily;
create policy "Users can update their own usage rows"
on public.usage_daily
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can select their own reply history" on public.reply_history;
create policy "Users can select their own reply history"
on public.reply_history
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own reply history" on public.reply_history;
create policy "Users can insert their own reply history"
on public.reply_history
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reply history" on public.reply_history;
create policy "Users can delete their own reply history"
on public.reply_history
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select their own subscription row" on public.subscriptions;
create policy "Users can select their own subscription row"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);
