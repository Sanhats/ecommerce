-- Stock único por variante: el showroom y la tienda online comparten la misma cantidad.
alter table public.product_variants
  add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0);

alter table public.product_variants
  add column if not exists reserved_quantity integer not null default 0 check (reserved_quantity >= 0);

-- Conservamos el inventario anterior como histórico y migramos sus totales al stock global.
update public.product_variants as variant
set
  stock_quantity = coalesce((
    select sum(inventory.quantity)
    from public.inventory
    where inventory.variant_id = variant.id
  ), 0),
  reserved_quantity = coalesce((
    select sum(inventory.reserved_quantity)
    from public.inventory
    where inventory.variant_id = variant.id
  ), 0)
where exists (
  select 1
  from public.inventory
  where inventory.variant_id = variant.id
);

-- Los movimientos globales no pertenecen a una ubicación específica.
alter table public.stock_movements
  alter column location_id drop not null;

create or replace function public.reserve_order_stock(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  current_variant record;
begin
  for item in
    select variant_id, quantity
    from public.order_items
    where order_id = target_order_id
  loop
    select stock_quantity, reserved_quantity
    into current_variant
    from public.product_variants
    where id = item.variant_id
    for update;

    if not found or current_variant.stock_quantity - current_variant.reserved_quantity < item.quantity then
      raise exception 'INSUFFICIENT_STOCK:%', item.variant_id;
    end if;

    update public.product_variants
    set reserved_quantity = reserved_quantity + item.quantity,
        updated_at = now()
    where id = item.variant_id;

    insert into public.stock_movements
      (variant_id, location_id, type, quantity, reference, notes)
    values
      (item.variant_id, null, 'reservation', item.quantity, target_order_id::text, 'Reserva automática de pedido');
  end loop;
end;
$$;

create or replace function public.release_order_stock(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  movement record;
begin
  if exists (
    select 1 from public.stock_movements
    where reference = target_order_id::text and type = 'release'
  ) then
    return;
  end if;

  for movement in
    select variant_id, quantity
    from public.stock_movements
    where reference = target_order_id::text and type = 'reservation'
  loop
    update public.product_variants
    set reserved_quantity = greatest(0, reserved_quantity - movement.quantity),
        updated_at = now()
    where id = movement.variant_id;

    insert into public.stock_movements
      (variant_id, location_id, type, quantity, reference, notes)
    values
      (movement.variant_id, null, 'release', movement.quantity, target_order_id::text, 'Liberación por cancelación de pedido');
  end loop;
end;
$$;

create or replace function public.fulfill_order_stock(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  movement record;
begin
  if exists (
    select 1 from public.stock_movements
    where reference = target_order_id::text and type = 'sale'
  ) then
    return;
  end if;

  for movement in
    select variant_id, quantity
    from public.stock_movements
    where reference = target_order_id::text and type = 'reservation'
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - movement.quantity,
        reserved_quantity = greatest(0, reserved_quantity - movement.quantity),
        updated_at = now()
    where id = movement.variant_id
      and stock_quantity >= movement.quantity
      and reserved_quantity >= movement.quantity;

    if not found then
      raise exception 'INVENTORY_FULFILLMENT_FAILED:%', movement.variant_id;
    end if;

    insert into public.stock_movements
      (variant_id, location_id, type, quantity, reference, notes)
    values
      (movement.variant_id, null, 'sale', movement.quantity, target_order_id::text, 'Descuento por pedido completado');
  end loop;
end;
$$;
