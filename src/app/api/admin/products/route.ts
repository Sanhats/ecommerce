import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const slugify = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const variants = Array.isArray(body.variants) && body.variants.length ? body.variants : [{ sku: body.sku, price: body.price, quantity: body.quantity }];
    const primaryPrice = Number(variants[0]?.price);
    if (!name || !Number.isFinite(primaryPrice) || primaryPrice < 0) return NextResponse.json({ error: "Nombre y precio de la primera variante son obligatorios" }, { status: 400 });
    const { data: { user } } = await (await createServerClient()).auth.getUser();
    if (!user) return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    const supabase = createAdminClient();
    const { data: membership } = await supabase.from("store_members").select("store_id").eq("user_id", user.id).limit(1).maybeSingle();
    const storeId = membership?.store_id;
    if (!storeId) return NextResponse.json({ error: "El usuario no tiene una tienda asignada" }, { status: 403 });
    const { data: product, error } = await supabase.from("products").insert({ store_id: storeId, category_id: body.category_id || null, name, slug: `${slugify(name)}-${Date.now().toString(36)}`, description: body.description || null, brand: body.brand || null, gender: body.gender || null, status: body.status || "draft" }).select("id, name, slug, status").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const optionNames = [...new Set(variants.flatMap((variant: { size?: string; color?: string }) => [variant.size ? "Talle" : null, variant.color ? "Color" : null].filter(Boolean)))];
    const optionIds = new Map<string, string>();
    for (const optionName of optionNames) {
      const { data: option, error: optionError } = await supabase.from("product_options").insert({ product_id: product.id, name: optionName }).select("id").single();
      if (optionError) { await supabase.from("products").delete().eq("id", product.id); return NextResponse.json({ error: optionError.message }, { status: 400 }); }
      optionIds.set(String(optionName), option.id);
    }
    let variantError: { message: string } | null = null;
    const createdVariants: { id: string; sku: string }[] = [];
    for (const variant of variants) {
      const generatedSku = `${slugify(name).slice(0, 12).toUpperCase()}-${String(variants.indexOf(variant) + 1).padStart(3, "0")}`;
      const stockQuantity = Number(variant.quantity ?? variant.stock_quantity ?? 0);
      if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
        variantError = { message: "La cantidad inicial debe ser un número entero mayor o igual a cero" };
        break;
      }
      const { data: createdVariant, error } = await supabase.from("product_variants").insert({ product_id: product.id, sku: generatedSku, price: Number(variant.price ?? primaryPrice), compare_at_price: variant.compare_at_price ? Number(variant.compare_at_price) : null, stock_quantity: stockQuantity }).select("id").single();
      if (error) { variantError = error; break; }
      createdVariants.push({ id: createdVariant.id, sku: generatedSku });
      for (const [nameKey, value] of [["Talle", variant.size], ["Color", variant.color]] as const) {
        if (!value || !optionIds.has(nameKey)) continue;
        const { data: optionValue, error: valueError } = await supabase.from("product_option_values").upsert({ option_id: optionIds.get(nameKey), value }, { onConflict: "option_id,value" }).select("id").single();
        if (valueError) { variantError = valueError; break; }
        const { error: linkError } = await supabase.from("variant_option_values").insert({ variant_id: createdVariant.id, option_value_id: optionValue.id });
        if (linkError) { variantError = linkError; break; }
      }
      if (variantError) break;
    }
    if (variantError) { await supabase.from("products").delete().eq("id", product.id); return NextResponse.json({ error: variantError.message }, { status: 400 }); }
    return NextResponse.json({ product, variants: createdVariants }, { status: 201 });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
