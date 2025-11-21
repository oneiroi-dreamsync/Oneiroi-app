create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table dreams enable row level security;

create policy "anyone can read dreams"
  on dreams for select using (true);

create policy "users can insert own dreams"
  on dreams for insert with check (auth.uid() = user_id);
