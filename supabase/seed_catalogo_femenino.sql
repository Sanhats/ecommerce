-- Catálogo editorial de demostración: moda femenina primavera/verano.
-- Usa contenido realista e imágenes públicas para probar la tienda.
do $$
declare
  v_store uuid;
  v_category uuid;
  v_product uuid;
  v_collection uuid;
  v_collection_new uuid;
  v_collection_essentials uuid;
  v_collection_party uuid;
begin
  select id into v_store from public.stores order by created_at limit 1;
  if v_store is null then raise exception 'Creá primero una tienda en public.stores'; end if;

  -- Limpia únicamente los datos demo anteriores para que el catálogo público
  -- no mezcle productos de prueba con la propuesta real de Lunora.
  delete from public.product_collections pc
  using public.products p
  where pc.product_id = p.id and p.store_id = v_store and p.slug like 'demo-%';
  -- Se archivan los productos demo en lugar de borrarlos, para no romper
  -- movimientos de stock históricos si ya se habían usado en pruebas.
  update public.products set status = 'archived', is_featured = false
  where store_id = v_store and slug like 'demo-%';
  delete from public.categories where store_id = v_store and slug like 'demo-%';
  delete from public.collections where store_id = v_store and slug like 'demo-%';

  -- Normaliza el slug antiguo que se usó para probar la categoría de accesorios.
  if exists (select 1 from public.categories where store_id = v_store and slug = 'accesorios-reales') then
    if not exists (select 1 from public.categories where store_id = v_store and slug = 'accesorios') then
      update public.categories set slug = 'accesorios'
      where store_id = v_store and slug = 'accesorios-reales';
    else
      update public.products set category_id = (select id from public.categories where store_id = v_store and slug = 'accesorios')
      where category_id = (select id from public.categories where store_id = v_store and slug = 'accesorios-reales');
      delete from public.categories where store_id = v_store and slug = 'accesorios-reales';
    end if;
  end if;

  insert into public.collections (store_id, name, slug, description) values (v_store, 'Primavera Verano 2026', 'primavera-verano-2026', 'Una selección liviana y luminosa para la temporada cálida.') on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_collection from public.collections where store_id = v_store and slug = 'primavera-verano-2026';
  insert into public.collections (store_id, name, slug, description) values (v_store, 'Nuevos ingresos', 'nuevos-ingresos', 'Las piezas que recién llegan al showroom.') on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_collection_new from public.collections where store_id = v_store and slug = 'nuevos-ingresos';
  insert into public.collections (store_id, name, slug, description) values (v_store, 'Esenciales de verano', 'esenciales-de-verano', 'Básicos frescos para armar looks todos los días.') on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_collection_essentials from public.collections where store_id = v_store and slug = 'esenciales-de-verano';
  insert into public.collections (store_id, name, slug, description) values (v_store, 'Looks de fiesta', 'looks-de-fiesta', 'Texturas y siluetas para celebrar las noches cálidas.') on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_collection_party from public.collections where store_id = v_store and slug = 'looks-de-fiesta';

  -- Vestidos
  insert into public.categories (store_id, name, slug, description, sort_order) values (v_store, 'Vestidos', 'vestidos', 'Vestidos frescos para el día y la noche.', 10) on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_category from public.categories where store_id = v_store and slug = 'vestidos';
  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values (v_store, v_category, 'Vestido Aura', 'vestido-aura', 'Vestido midi de lino con tiras finas, espalda cruzada y una caída liviana ideal para las tardes cálidas.', 'Lunora', 'Mujer', 'active', true) on conflict (store_id, slug) do update set description = excluded.description, status = 'active';
  select id into v_product from public.products where store_id = v_store and slug = 'vestido-aura';
  insert into public.product_variants (product_id, sku, price) values (v_product, 'AURA-001', 68900) on conflict (sku) do nothing;
  insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200', 'Vestido Aura color natural' where not exists (select 1 from public.product_images where product_id = v_product);
  insert into public.product_collections values (v_product, v_collection) on conflict do nothing;

  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values (v_store, v_category, 'Vestido Sol', 'vestido-sol', 'Vestido corto de algodón con volumen suave y escote cuadrado. Una pieza simple para usar todo el verano.', 'Lunora', 'Mujer', 'active', false) on conflict (store_id, slug) do update set description = excluded.description, status = 'active';
  select id into v_product from public.products where store_id = v_store and slug = 'vestido-sol';
  insert into public.product_variants (product_id, sku, price) values (v_product, 'SOL-001', 54900) on conflict (sku) do nothing;
  insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200', 'Vestido Sol' where not exists (select 1 from public.product_images where product_id = v_product);
  insert into public.product_collections values (v_product, v_collection) on conflict do nothing;

  -- Tops
  insert into public.categories (store_id, name, slug, description, sort_order) values (v_store, 'Tops', 'tops', 'Remeras, musculosas y blusas para combinar.', 20) on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_category from public.categories where store_id = v_store and slug = 'tops';
  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values (v_store, v_category, 'Top Nube', 'top-nube', 'Top de punto suave con escote limpio y calce al cuerpo. Un esencial para usar solo o en capas.', 'Lunora', 'Mujer', 'active', true) on conflict (store_id, slug) do update set description = excluded.description, status = 'active';
  select id into v_product from public.products where store_id = v_store and slug = 'top-nube';
  insert into public.product_variants (product_id, sku, price) values (v_product, 'NUBE-001', 29900) on conflict (sku) do nothing;
  insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200', 'Top Nube color blanco' where not exists (select 1 from public.product_images where product_id = v_product);
  insert into public.product_collections values (v_product, v_collection) on conflict do nothing;

  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values (v_store, v_category, 'Blusa Brisa', 'blusa-brisa', 'Blusa liviana de manga corta y textura natural, pensada para los días de calor.', 'Lunora', 'Mujer', 'active', false) on conflict (store_id, slug) do update set description = excluded.description, status = 'active';
  select id into v_product from public.products where store_id = v_store and slug = 'blusa-brisa';
  insert into public.product_variants (product_id, sku, price) values (v_product, 'BRISA-001', 45900) on conflict (sku) do nothing;
  insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1564257577054-0e7d6f3e7d9e?w=1200', 'Blusa Brisa' where not exists (select 1 from public.product_images where product_id = v_product);
  insert into public.product_collections values (v_product, v_collection) on conflict do nothing;

  -- Pantalones y conjuntos
  insert into public.categories (store_id, name, slug, description, sort_order) values (v_store, 'Pantalones', 'pantalones', 'Sastrería liviana y siluetas relajadas.', 30) on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_category from public.categories where store_id = v_store and slug = 'pantalones';
  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values (v_store, v_category, 'Pantalón Palma', 'pantalon-palma', 'Pantalón wide leg de tiro alto, con cintura cómoda y movimiento amplio.', 'Lunora', 'Mujer', 'active', true) on conflict (store_id, slug) do update set description = excluded.description, status = 'active';
  select id into v_product from public.products where store_id = v_store and slug = 'pantalon-palma';
  insert into public.product_variants (product_id, sku, price) values (v_product, 'PALMA-001', 59900) on conflict (sku) do nothing;
  insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=1200', 'Pantalón Palma' where not exists (select 1 from public.product_images where product_id = v_product);
  insert into public.product_collections values (v_product, v_collection) on conflict do nothing;

  -- Accesorios
  insert into public.categories (store_id, name, slug, description, sort_order) values (v_store, 'Accesorios', 'accesorios', 'Bolsos y accesorios para completar cada look.', 40) on conflict (store_id, slug) do update set description = excluded.description;
  select id into v_category from public.categories where store_id = v_store and slug = 'accesorios';
  insert into public.products (store_id, category_id, name, slug, description, brand, gender, status, is_featured) values (v_store, v_category, 'Bolso Roma', 'bolso-roma', 'Bolso de hombro estructurado con interior amplio y herrajes discretos.', 'Lunora', 'Mujer', 'active', true) on conflict (store_id, slug) do update set description = excluded.description, status = 'active';
  select id into v_product from public.products where store_id = v_store and slug = 'bolso-roma';
  insert into public.product_variants (product_id, sku, price) values (v_product, 'ROMA-001', 75900) on conflict (sku) do nothing;
  insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200', 'Bolso Roma' where not exists (select 1 from public.product_images where product_id = v_product);
  insert into public.product_collections values (v_product, v_collection) on conflict do nothing;

  -- Imágenes de portada para las categorías del showroom.
  update public.categories set image_url = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800' where store_id = v_store and slug = 'vestidos';
  update public.categories set image_url = 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800' where store_id = v_store and slug = 'tops';
  update public.categories set image_url = 'https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=800' where store_id = v_store and slug = 'pantalones';
  update public.categories set image_url = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800' where store_id = v_store and slug = 'accesorios';

  -- Curaduría de las colecciones secundarias para que cada landing tenga contenido real.
  insert into public.product_collections (product_id, collection_id)
  select p.id, c.id
  from public.products p cross join public.collections c
  where p.store_id = v_store and c.store_id = v_store
    and p.slug in ('vestido-aura', 'top-nube', 'bolso-roma')
    and c.slug = 'nuevos-ingresos'
  on conflict do nothing;

  insert into public.product_collections (product_id, collection_id)
  select p.id, c.id
  from public.products p cross join public.collections c
  where p.store_id = v_store and c.store_id = v_store
    and p.slug in ('vestido-sol', 'blusa-brisa', 'pantalon-palma')
    and c.slug = 'esenciales-de-verano'
  on conflict do nothing;

  insert into public.product_collections (product_id, collection_id)
  select p.id, c.id
  from public.products p cross join public.collections c
  where p.store_id = v_store and c.store_id = v_store
    and p.slug in ('vestido-aura', 'vestido-sol', 'bolso-roma')
    and c.slug = 'looks-de-fiesta'
  on conflict do nothing;
end $$;
