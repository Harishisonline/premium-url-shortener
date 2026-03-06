-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: urls
create table urls (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  original_url text not null,
  short_url text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  custom_alias text unique,
  qr_code text
);

-- Table: analytics
create table analytics (
  id bigint primary key generated always as identity,
  created_at timestamptz default now(),
  url_id uuid references urls(id) on delete cascade not null,
  city text,
  country text,
  device text,
  browser text
);

-- RLS (Row Level Security)
alter table urls enable row level security;
alter table analytics enable row level security;

-- Policies for urls
create policy "Users can view their own urls" on urls
  for select using (auth.uid() = user_id);

create policy "Users can insert their own urls" on urls
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own urls" on urls
  for update using (auth.uid() = user_id);

create policy "Users can delete their own urls" on urls
  for delete using (auth.uid() = user_id);

-- Policies for analytics
create policy "Users can view analytics for their own urls" on analytics
  for select using (
    exists (
      select 1 from urls where urls.id = analytics.url_id and urls.user_id = auth.uid()
    )
  );

-- Function to handle public URL redirection (if needed for Edge Functions or just logging)
-- Usually analytics are logged during redirection.
