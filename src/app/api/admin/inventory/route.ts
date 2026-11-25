import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const variantId = String(body.variant_id || "").trim(), locationId = String(body.location_id || "").trim(), quantity = Number(body.quantity);
    if (!variantId || !locationId || !Number.isInteger(quantity) || quantity < 0) return NextResponse.json({ error: "variante, ubicación y cantidad válida son obligatorios" }, { status: 400 });
    const supabase = createAdminClient();
    const { data: current } = await supabase.from("inventory").select("quantity").eq("variant_id", variantId).eq("location_id", locationId).maybeSingle();
    const { data, error } = await supabase.from("inventory").upsert({ variant_id: variantId, location_id: locationId, quantity, reserved_quantity: 0, updated_at: new Date().toISOString() }).select("variant_id, location_id, quantity, reserved_quantity").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const difference = quantity - (current?.quantity || 0);
    if (difference !== 0) await supabase.from("stock_movements").insert({ variant_id: variantId, location_id: locationId, type: "adjustment", quantity: difference, notes: "Ajuste desde el panel" });
    return NextResponse.json({ inventory: data }, { status: 200 });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
