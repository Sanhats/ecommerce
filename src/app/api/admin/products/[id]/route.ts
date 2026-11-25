import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updates = { category_id: body.category_id || null, name: body.name, description: body.description || null, brand: body.brand || null, gender: body.gender || null, status: body.status, is_featured: typeof body.is_featured === "boolean" ? body.is_featured : undefined };
    const { data, error } = await createAdminClient().from("products").update(updates).eq("id", id).select("id, name, description, brand, gender, status").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ product: data });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await createAdminClient().from("products").update({ status: "archived" }).eq("id", id).select("id, status").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data });
}
