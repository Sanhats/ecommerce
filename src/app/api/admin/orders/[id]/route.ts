import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowed = ["pending", "confirmed", "preparing", "shipped", "completed", "cancelled", "refunded"];
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    if (!allowed.includes(body.status)) return NextResponse.json({ error: "Estado de pedido inválido" }, { status: 400 });
    const supabase = createAdminClient();
    const { data: current } = await supabase.from("orders").select("status").eq("id", id).single();
    const { data, error } = await supabase.from("orders").update({ status: body.status, payment_status: body.payment_status || undefined, updated_at: new Date().toISOString() }).eq("id", id).select("id, order_number, status, payment_status").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (body.status === "cancelled" && current?.status !== "cancelled") await supabase.rpc("release_order_stock", { target_order_id: id });
    if (body.status === "completed" && current?.status !== "completed") {
      const { error: fulfillmentError } = await supabase.rpc("fulfill_order_stock", { target_order_id: id });
      if (fulfillmentError) { await supabase.from("orders").update({ status: current?.status || "pending", updated_at: new Date().toISOString() }).eq("id", id); return NextResponse.json({ error: "No se pudo descontar el stock del pedido" }, { status: 409 }); }
    }
    return NextResponse.json({ order: data });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
