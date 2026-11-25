import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storeId = String(body.store_id || "").trim(), name = String(body.name || "").trim();
    if (!storeId || !name) return NextResponse.json({ error: "store_id y nombre son obligatorios" }, { status: 400 });
    const { data, error } = await createAdminClient().from("locations").insert({ store_id: storeId, name, type: body.type || "showroom", address: body.address || null }).select("id, name, type, address").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ location: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}

export async function GET(request: Request) {
  const storeId = new URL(request.url).searchParams.get("store_id");
  if (!storeId) return NextResponse.json({ error: "store_id es obligatorio" }, { status: 400 });
  const { data, error } = await createAdminClient().from("locations").select("id, name, type, address").eq("store_id", storeId).order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ locations: data });
}
