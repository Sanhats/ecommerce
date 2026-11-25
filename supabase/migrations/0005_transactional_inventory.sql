create or replace function public.reserve_order_stock(target_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare item record; row_stock record; remaining integer;
begin
  for item in select variant_id, quantity from public.order_items where order_id = target_order_id loop
    remaining := item.quantity;
    for row_stock in select variant_id, location_id, quantity, reserved_quantity from public.inventory where variant_id = item.variant_id and quantity > reserved_quantity order by quantity - reserved_quantity desc for update loop
      exit when remaining <= 0;
      if (row_stock.quantity - row_stock.reserved_quantity) >= remaining then
        update public.inventory set reserved_quantity = reserved_quantity + remaining, updated_at = now() where variant_id = row_stock.variant_id and location_id = row_stock.location_id;
        insert into public.stock_movements (variant_id, location_id, type, quantity, reference, notes) values (item.variant_id, row_stock.location_id, 'reservation', remaining, target_order_id::text, 'Reserva automática de pedido'); remaining := 0;
      else
        update public.inventory set reserved_quantity = quantity, updated_at = now() where variant_id = row_stock.variant_id and location_id = row_stock.location_id;
        insert into public.stock_movements (variant_id, location_id, type, quantity, reference, notes) values (item.variant_id, row_stock.location_id, 'reservation', row_stock.quantity - row_stock.reserved_quantity, target_order_id::text, 'Reserva automática de pedido'); remaining := remaining - (row_stock.quantity - row_stock.reserved_quantity);
      end if;
    end loop;
    if remaining > 0 then raise exception 'INSUFFICIENT_STOCK:%', item.variant_id; end if;
  end loop;
end; $$;

create or replace function public.release_order_stock(target_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare movement record;
begin
  for movement in select variant_id, location_id, quantity from public.stock_movements where reference = target_order_id::text and type = 'reservation' loop
    update public.inventory set reserved_quantity = greatest(0, reserved_quantity - movement.quantity), updated_at = now() where variant_id = movement.variant_id and location_id = movement.location_id;
    insert into public.stock_movements (variant_id, location_id, type, quantity, reference, notes) values (movement.variant_id, movement.location_id, 'release', movement.quantity, target_order_id::text, 'Liberación por cancelación de pedido');
  end loop;
end; $$;
