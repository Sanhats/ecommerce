import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length || !body.full_name || !body.email) return NextResponse.json({ error: "El carrito y los datos del cliente son obligatorios" }, { status: 400 });
    const supabase = createAdminClient();
    const ids = items.map((item: { variantId: string }) => item.variantId);
    const { data: variants, error: variantError } = await supabase.from("product_variants").select("id, product_id, sku, price, products!inner(id, name, store_id)").in("id", ids).eq("is_active", true);
    if (variantError || !variants || variants.length !== ids.length) return NextResponse.json({ error: "Una variante ya no está disponible" }, { status: 400 });
    const { data: stockRows } = await supabase.from("inventory").select("variant_id, quantity, reserved_quantity").in("variant_id", ids);
    for (const item of items) { const available = (stockRows || []).filter(row => row.variant_id === item.variantId).reduce((sum, row) => sum + row.quantity - row.reserved_quantity, 0); if (available < Number(item.quantity)) return NextResponse.json({ error: "Stock insuficiente para una de las variantes" }, { status: 409 }); }
    const storeId = variants[0].products[0].store_id;
    const subtotal = items.reduce((sum: number, item: { variantId: string; quantity: number }) => { const variant = variants.find(v => v.id === item.variantId); return sum + Number(variant?.price || 0) * Number(item.quantity); }, 0);
    const { data: customer, error: customerError } = await supabase.from("customers").insert({ store_id: storeId, full_name: body.full_name, email: body.email, phone: body.phone || null }).select("id").single();
    if (customerError) return NextResponse.json({ error: customerError.message }, { status: 400 });
    const { data: order, error: orderError } = await supabase.from("orders").insert({ store_id: storeId, customer_id: customer.id, status: "pending", payment_status: "pending", fulfillment_method: body.fulfillment_method || "shipping", subtotal, total: subtotal, customer_email: body.email, customer_phone: body.phone || null }).select("id, order_number").single();
    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });
    const { error: itemError } = await supabase.from("order_items").insert(items.map((item: { variantId: string; quantity: number }) => { const variant = variants.find(v => v.id === item.variantId)!; return { order_id: order.id, variant_id: variant.id, product_name: variant.products[0].name, sku: variant.sku, quantity: item.quantity, unit_price: variant.price, total: Number(variant.price) * Number(item.quantity) }; }));
    if (itemError) return NextResponse.json({ error: itemError.message }, { status: 400 });
    const { error: reservationError } = await supabase.rpc("reserve_order_stock", { target_order_id: order.id });
    if (reservationError) { await supabase.from("orders").delete().eq("id", order.id); return NextResponse.json({ error: "No hay stock suficiente para completar el pedido" }, { status: 409 }); }
    return NextResponse.json({ order }, { status: 201 });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
