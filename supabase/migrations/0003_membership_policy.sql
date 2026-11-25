alter table public.store_members enable row level security;
create policy "members can view own memberships" on public.store_members for select using (user_id = auth.uid());
