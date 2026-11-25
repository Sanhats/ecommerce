import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { data, error } = await createAdminClient().from("product_variants").update({ sku: String(body.sku || "").trim(), price: Number(body.price), compare_at_price: body.compare_at_price ? Number(body.compare_at_price) : null, is_active: body.is_active !== false }).eq("id", id).select("id, sku, price, compare_at_price, is_active").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ variant: data });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
