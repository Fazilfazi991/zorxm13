-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) 
    on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  credits integer default 3,
  plan text default 'free',
  created_at timestamptz default now(),
  credits_reset_at timestamptz
);

-- Generations table
create table public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) 
    on delete cascade,
  page_type text,
  business_name text,
  style_id text,
  primary_color text,
  created_at timestamptz default now()
);

-- Credit transactions
create table public.credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) 
    on delete cascade,
  type text check (type in ('deduct', 'add')),
  amount integer,
  reason text,
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure 
    public.handle_new_user();

-- Deduct credit function
create or replace function public.deduct_credit(
  user_id uuid
)
returns void as $$
begin
  update public.profiles
  set credits = greatest(0, credits - 1)
  where id = user_id and credits > 0;
  
  insert into public.credit_transactions (
    user_id, type, amount, reason
  ) values (
    user_id, 'deduct', 1, 'page_generation'
  );
end;
$$ language plpgsql security definer;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.credit_transactions 
  enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can view own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

create table public.plugin_licenses (
  id uuid default gen_random_uuid() primary key,
  license_key text unique not null,
  email text not null,
  site_url text,
  credits integer default 3,
  plan text default 'free',
  last_used timestamptz,
  created_at timestamptz default now()
);

create index on public.plugin_licenses(license_key);
create index on public.plugin_licenses(email);

alter table public.plugin_licenses 
  enable row level security;

-- Service key bypasses RLS so no policies needed
-- for server-side operations
