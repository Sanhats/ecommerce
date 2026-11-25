import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await request.formData();
  const file = form.get("file");
  const variantId = String(form.get("variant_id") || "").trim() || null;
  if (!(file instanceof File) || !file.type.startsWith("image/")) return NextResponse.json({ error: "Seleccioná una imagen válida" }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${id}/${crypto.randomUUID()}.${extension}`;
  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });
  const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
  const { data, error } = await supabase.from("product_images").insert({ product_id: id, variant_id: variantId, url: publicUrl.publicUrl, alt_text: file.name }).select("id, url, alt_text, variant_id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ image: data }, { status: 201 });
}
