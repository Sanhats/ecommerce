-- Políticas iniciales para separar catálogo público de operaciones privadas.
create or replace function public.is_store_member(target_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.store_members where store_id = target_store_id and user_id = auth.uid());
$$;

create policy "members can manage stores" on public.stores for all using (public.is_store_member(id)) with check (public.is_store_member(id));
create policy "members can manage products" on public.products for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "members can manage categories" on public.categories for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "members can manage orders" on public.orders for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "members can manage customers" on public.customers for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "members can manage locations" on public.locations for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "members can manage variants" on public.product_variants for all using (exists (select 1 from public.products p where p.id = product_id and public.is_store_member(p.store_id))) with check (exists (select 1 from public.products p where p.id = product_id and public.is_store_member(p.store_id)));
create policy "members can manage inventory" on public.inventory for all using (exists (select 1 from public.locations l where l.id = location_id and public.is_store_member(l.store_id))) with check (exists (select 1 from public.locations l where l.id = location_id and public.is_store_member(l.store_id)));
