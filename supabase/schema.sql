create extension if not exists "pgcrypto";

create table if not exists weather_history (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  country text,
  latitude double precision not null,
  longitude double precision not null,
  temperature numeric not null,
  humidity integer not null,
  pressure integer not null,
  wind_speed numeric not null,
  weather_condition text not null,
  forecast_data jsonb not null default '{}'::jsonb,
  searched_at timestamptz not null default now()
);

create table if not exists favorite_locations (
  id uuid primary key default gen_random_uuid(),
  city_name text not null,
  country text,
  created_at timestamptz not null default now()
);

create table if not exists user_searches (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  search_type text not null check (search_type in ('city_or_landmark', 'zip', 'postal', 'coordinates', 'geolocation')),
  created_at timestamptz not null default now()
);

create index if not exists idx_weather_history_searched_at on weather_history (searched_at desc);
create index if not exists idx_weather_history_location on weather_history (location);
create index if not exists idx_favorite_locations_city on favorite_locations (city_name);
create index if not exists idx_user_searches_created_at on user_searches (created_at desc);

alter table weather_history enable row level security;
alter table favorite_locations enable row level security;
alter table user_searches enable row level security;

create policy "allow anon read weather history"
  on weather_history for select
  to anon
  using (true);

create policy "allow anon insert weather history"
  on weather_history for insert
  to anon
  with check (true);

create policy "allow anon update weather history"
  on weather_history for update
  to anon
  using (true)
  with check (true);

create policy "allow anon delete weather history"
  on weather_history for delete
  to anon
  using (true);

create policy "allow anon read favorites"
  on favorite_locations for select
  to anon
  using (true);

create policy "allow anon insert favorites"
  on favorite_locations for insert
  to anon
  with check (true);

create policy "allow anon update favorites"
  on favorite_locations for update
  to anon
  using (true)
  with check (true);

create policy "allow anon delete favorites"
  on favorite_locations for delete
  to anon
  using (true);

create policy "allow anon read searches"
  on user_searches for select
  to anon
  using (true);

create policy "allow anon insert searches"
  on user_searches for insert
  to anon
  with check (true);

create policy "allow anon delete searches"
  on user_searches for delete
  to anon
  using (true);
