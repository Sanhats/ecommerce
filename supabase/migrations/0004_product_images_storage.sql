insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "public can view product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "authenticated can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
