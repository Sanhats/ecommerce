-- Agrega imágenes reales de demostración a los productos demo existentes.
-- Las imágenes son de Unsplash y sirven para probar catálogo y fichas de producto.
do $$
declare
  v_product uuid;
  v_variant uuid;
begin
  select id into v_product from public.products where slug = 'demo-blazer-linen';
  if v_product is not null then
    insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=1200', 'Blazer linen beige' where not exists (select 1 from public.product_images where product_id = v_product and url like '%1591369822096%');
    select id into v_variant from public.product_variants where product_id = v_product limit 1;
    insert into public.product_images (product_id, variant_id, url, alt_text) select v_product, v_variant, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200', 'Blazer beige detalle' where v_variant is not null and not exists (select 1 from public.product_images where variant_id = v_variant);
  end if;
  select id into v_product from public.products where slug = 'demo-remera-essential';
  if v_product is not null then insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200', 'Remera esencial negra' where not exists (select 1 from public.product_images where product_id = v_product); end if;
  select id into v_product from public.products where slug = 'demo-pantalon-wide-leg';
  if v_product is not null then insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1506629905607-d9c297d29f98?w=1200', 'Pantalón wide leg beige' where not exists (select 1 from public.product_images where product_id = v_product); end if;
  select id into v_product from public.products where slug = 'demo-campera-field';
  if v_product is not null then insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200', 'Campera field marrón' where not exists (select 1 from public.product_images where product_id = v_product); end if;
  select id into v_product from public.products where slug = 'demo-bolso-leather';
  if v_product is not null then insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200', 'Bolso leather' where not exists (select 1 from public.product_images where product_id = v_product); end if;
  select id into v_product from public.products where slug = 'demo-anteojos-oversized';
  if v_product is not null then insert into public.product_images (product_id, url, alt_text) select v_product, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200', 'Anteojos oversized' where not exists (select 1 from public.product_images where product_id = v_product); end if;
end $$;
