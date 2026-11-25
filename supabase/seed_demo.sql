-- Datos de demostración para visualizar la tienda pública.
-- Ejecutar después de las migraciones 0001 a 0007.
do $$
declare
  v_store uuid;
  v_cat_women uuid;
  v_cat_men uuid;
  v_cat_accessories uuid;
  v_collection uuid;
  v_product uuid;
  v_variant uuid;
begin
  select id into v_store from public.stores order by created_at limit 1;
  if v_store is null then raise exception 'Creá primero una tienda en public.stores'; end if;

  insert into public.categories (store_id, name, slug, description, sort_order) values
    (v_store, 'Mujer', 'demo-mujer', 'Prendas femeninas seleccionadas', 1),
    (v_store, 'Hombre', 'demo-hombre', 'Piezas esenciales para todos los días', 2),
    (v_store, 'Accesorios', 'demo-accesorios', 'Detalles que completan el look', 3)
  on conflict (store_id, slug) do update set name = excluded.name;
  select id into v_cat_women from public.categories where store_id = v_store and slug = 'demo-mujer';
  select id into v_cat_men from public.categories where store_id = v_store and slug = 'demo-hombre';
  select id into v_cat_accessories from public.categories where store_id = v_store and slug = 'demo-accesorios';

  insert into public.collections (store_id, name, slug, description) values (v_store, 'Demo · Nueva temporada', 'demo-nueva-temporada', 'Colección de demostración') on conflict (store_id, slug) do update set name = excluded.name;
  select id into v_collection from public.collections where store_id = v_store and slug = 'demo-nueva-temporada';

  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values
    (v_store, v_cat_women, 'Blazer Linen', 'demo-blazer-linen', 'Blazer liviano de corte relajado para elevar cualquier look.', 'Showroom', 'Mujer', 'active', true),
    (v_store, v_cat_women, 'Remera Essential', 'demo-remera-essential', 'Remera de algodón con una silueta limpia y versátil.', 'Showroom', 'Mujer', 'active', true),
    (v_store, v_cat_women, 'Pantalón Wide Leg', 'demo-pantalon-wide-leg', 'Pantalón de pierna amplia y caída suave.', 'Showroom', 'Mujer', 'active', true),
    (v_store, v_cat_men, 'Campera Field', 'demo-campera-field', 'Campera de inspiración utilitaria para todos los días.', 'Showroom', 'Hombre', 'active', false),
    (v_store, v_cat_accessories, 'Bolso Leather Shoulder', 'demo-bolso-leather', 'Bolso estructurado para acompañar cualquier ocasión.', 'Showroom', 'Unisex', 'active', true),
    (v_store, v_cat_accessories, 'Anteojos Oversized', 'demo-anteojos-oversized', 'Anteojos de marco amplio con espíritu clásico.', 'Showroom', 'Unisex', 'active', false)
  on conflict (store_id, slug) do update set status = 'active';

  insert into public.product_variants (product_id, sku, price) select id, 'DEMO-BLAZER-001', 89900 from public.products where slug = 'demo-blazer-linen' on conflict (sku) do nothing;
  insert into public.product_variants (product_id, sku, price) select id, 'DEMO-REMERA-001', 29900 from public.products where slug = 'demo-remera-essential' on conflict (sku) do nothing;
  insert into public.product_variants (product_id, sku, price) select id, 'DEMO-PANTALON-001', 59900 from public.products where slug = 'demo-pantalon-wide-leg' on conflict (sku) do nothing;
  insert into public.product_variants (product_id, sku, price) select id, 'DEMO-CAMPERA-001', 79900 from public.products where slug = 'demo-campera-field' on conflict (sku) do nothing;
  insert into public.product_variants (product_id, sku, price) select id, 'DEMO-BOLSO-001', 75900 from public.products where slug = 'demo-bolso-leather' on conflict (sku) do nothing;
  insert into public.product_variants (product_id, sku, price) select id, 'DEMO-ANTEOJOS-001', 39900 from public.products where slug = 'demo-anteojos-oversized' on conflict (sku) do nothing;

  insert into public.product_images (product_id, url, alt_text) select p.id, x.url, p.name from public.products p join (values
    ('demo-blazer-linen','https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200'),
    ('demo-remera-essential','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200'),
    ('demo-pantalon-wide-leg','https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=1200'),
    ('demo-campera-field','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200'),
    ('demo-bolso-leather','https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200'),
    ('demo-anteojos-oversized','https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200')
  ) x(slug,url) on x.slug = p.slug where not exists (select 1 from public.product_images i where i.product_id = p.id and i.variant_id is null);

  insert into public.product_collections (product_id, collection_id) select p.id, v_collection from public.products p where p.slug like 'demo-%' on conflict do nothing;
end $$;
