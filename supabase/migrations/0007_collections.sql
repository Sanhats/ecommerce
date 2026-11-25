create table public.collections (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);
create table public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);
alter table public.collections enable row level security;
create policy "public can read active collections" on public.collections for select using (is_active = true);
create policy "members can manage collections" on public.collections for all using (public.is_store_member(store_id)) with check (public.is_store_member(store_id));
create policy "public can read product collections" on public.product_collections for select using (true);
