create or replace function public.fulfill_order_stock(target_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare movement record;
begin
  if exists (select 1 from public.stock_movements where reference = target_order_id::text and type = 'sale') then return; end if;
  for movement in select variant_id, location_id, quantity from public.stock_movements where reference = target_order_id::text and type = 'reservation' loop
    update public.inventory set quantity = quantity - movement.quantity, reserved_quantity = greatest(0, reserved_quantity - movement.quantity), updated_at = now() where variant_id = movement.variant_id and location_id = movement.location_id and quantity >= movement.quantity and reserved_quantity >= movement.quantity;
    if not found then raise exception 'INVENTORY_FULFILLMENT_FAILED:%', movement.variant_id; end if;
    insert into public.stock_movements (variant_id, location_id, type, quantity, reference, notes) values (movement.variant_id, movement.location_id, 'sale', movement.quantity, target_order_id::text, 'Descuento por pedido completado');
  end loop;
end; $$;
