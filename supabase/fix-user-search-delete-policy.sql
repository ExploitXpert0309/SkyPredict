alter table user_searches enable row level security;

drop policy if exists "allow anon delete searches" on user_searches;

create policy "allow anon delete searches"
  on user_searches for delete
  to anon
  using (true);

