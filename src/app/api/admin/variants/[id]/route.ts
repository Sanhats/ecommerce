import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    const { data: current, error: currentError } = await supabase.from("product_variants").select("stock_quantity, reserved_quantity").eq("id", id).single();
    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 400 });
    const stockQuantity = body.stock_quantity === undefined ? Number(current.stock_quantity || 0) : Number(body.stock_quantity);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) return NextResponse.json({ error: "El stock debe ser un número entero mayor o igual a cero" }, { status: 400 });
    if (stockQuantity < Number(current.reserved_quantity || 0)) return NextResponse.json({ error: "El stock no puede ser menor que las unidades reservadas" }, { status: 400 });
    const { data, error } = await supabase.from("product_variants").update({ sku: String(body.sku || "").trim(), price: Number(body.price), compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null, stock_quantity: stockQuantity, is_active: body.is_active !== false }).eq("id", id).select("id, sku, price, compare_at_price, stock_quantity, reserved_quantity, is_active").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const difference = stockQuantity - Number(current.stock_quantity || 0);
    if (difference !== 0) {
      const { error: movementError } = await supabase.from("stock_movements").insert({ variant_id: id, location_id: null, type: "adjustment", quantity: difference, notes: "Ajuste desde el producto" });
      if (movementError) return NextResponse.json({ error: movementError.message }, { status: 400 });
    }
    return NextResponse.json({ variant: data });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
