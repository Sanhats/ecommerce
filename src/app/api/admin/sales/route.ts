import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length || !body.store_id || !body.full_name) return NextResponse.json({ error: "Tienda, cliente y productos son obligatorios" }, { status: 400 });
    if (items.some((item: { variantId?: string; quantity?: number }) => !item.variantId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0)) return NextResponse.json({ error: "Las cantidades de la venta no son válidas" }, { status: 400 });
    const supabase = createAdminClient();
    const ids = items.map((item: { variantId: string }) => item.variantId);
    const { data: variants, error: variantError } = await supabase.from("product_variants").select("id, sku, price, stock_quantity, reserved_quantity, products!inner(name, store_id)").in("id", ids).eq("is_active", true);
    if (variantError || !variants || variants.length !== ids.length) return NextResponse.json({ error: "Una variante no está disponible" }, { status: 400 });
    const customerQuery = body.customer_id ? supabase.from("customers").select("id").eq("id", body.customer_id).eq("store_id", body.store_id).single() : supabase.from("customers").insert({ store_id: body.store_id, full_name: body.full_name, email: body.email || null, phone: body.phone || null }).select("id").single();
    const { data: customer, error: customerError } = await customerQuery;
    if (customerError) return NextResponse.json({ error: customerError.message }, { status: 400 });
    const subtotal = items.reduce((sum: number, item: { variantId: string; quantity: number }) => { const variant = variants.find(v => v.id === item.variantId); return sum + Number(variant?.price || 0) * Number(item.quantity); }, 0);
    const discount = Math.min(Math.max(Number(body.discount || 0), 0), subtotal);
    const total = subtotal - discount;
    const { data: order, error: orderError } = await supabase.from("orders").insert({ store_id: body.store_id, customer_id: customer.id, status: "pending", payment_status: body.payment_status || "pending", fulfillment_method: "showroom", subtotal, discount_total: discount, total, customer_email: body.email || null, customer_phone: body.phone || null, notes: body.notes || "Venta presencial" }).select("id, order_number").single();
    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });
    const { error: itemError } = await supabase.from("order_items").insert(items.map((item: { variantId: string; quantity: number }) => { const variant = variants.find(v => v.id === item.variantId)!; return { order_id: order.id, variant_id: variant.id, product_name: variant.products[0].name, sku: variant.sku, quantity: item.quantity, unit_price: variant.price, total: Number(variant.price) * Number(item.quantity) }; }));
    if (itemError) return NextResponse.json({ error: itemError.message }, { status: 400 });
    const { error: reservationError } = await supabase.rpc("reserve_order_stock", { target_order_id: order.id });
    if (reservationError) { await supabase.from("orders").delete().eq("id", order.id); return NextResponse.json({ error: "Stock insuficiente para la venta" }, { status: 409 }); }
    return NextResponse.json({ order }, { status: 201 });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
