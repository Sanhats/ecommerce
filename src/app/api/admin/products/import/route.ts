import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
type ImportVariant = { sku?: string; price: string | number; compare_at_price?: string | number; stock_quantity?: string | number; size?: string; color?: string };
type ImportProduct = { name: string; slug?: string; description?: string; brand?: string; gender?: string; status?: string; category?: string; collections?: string[]; image_url?: string; variants: ImportVariant[] };

function clean(value: unknown) { return String(value ?? "").trim(); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = Array.isArray(body.products) ? body.products as ImportProduct[] : [];
    if (!products.length) return NextResponse.json({ error: "No se recibieron productos para importar" }, { status: 400 });

    const { data: { user } } = await (await createServerClient()).auth.getUser();
    if (!user) return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
    const supabase = createAdminClient();
    const { data: membership } = await supabase.from("store_members").select("store_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (!membership?.store_id) return NextResponse.json({ error: "El usuario no tiene una tienda asignada" }, { status: 403 });

    const storeId = membership.store_id;
    const [{ data: categories }, { data: collections }] = await Promise.all([
      supabase.from("categories").select("id, name, slug").eq("store_id", storeId),
      supabase.from("collections").select("id, name, slug").eq("store_id", storeId),
    ]);
    const categoryByKey = new Map((categories || []).flatMap(item => [[item.slug.toLowerCase(), item], [item.name.toLowerCase(), item]]));
    const collectionByKey = new Map((collections || []).flatMap(item => [[item.slug.toLowerCase(), item], [item.name.toLowerCase(), item]]));
    const imported: { name: string; action: "created" | "updated"; variants: number }[] = [];
    const errors: { name: string; error: string }[] = [];

    for (const item of products) {
      const name = clean(item.name);
      if (!name) { errors.push({ name: "Fila sin nombre", error: "El nombre es obligatorio" }); continue; }
      const variants = Array.isArray(item.variants) ? item.variants : [];
      if (!variants.length || !Number.isFinite(Number(variants[0].price)) || Number(variants[0].price) < 0) { errors.push({ name, error: "Debe tener al menos una variante con precio válido" }); continue; }

      const categoryKey = clean(item.category).toLowerCase();
      const category = categoryKey ? categoryByKey.get(categoryKey) : null;
      if (categoryKey && !category) { errors.push({ name, error: `No existe la categoría '${item.category}'` }); continue; }
      const collectionKeys = (item.collections || []).map(clean).filter(Boolean).map(value => value.toLowerCase());
      const selectedCollections = collectionKeys.map(key => collectionByKey.get(key));
      const missingCollection = collectionKeys.find((key, index) => !selectedCollections[index]);
      if (missingCollection) { errors.push({ name, error: `No existe la colección '${missingCollection}'` }); continue; }

      const slug = slugify(clean(item.slug) || name) || `producto-${Date.now().toString(36)}`;
      const existing = await supabase.from("products").select("id, slug").eq("store_id", storeId).eq("slug", slug).maybeSingle();
      let productId = existing.data?.id;
      const isNewProduct = !productId;
      const productPayload = { store_id: storeId, category_id: category?.id || null, name, slug, description: clean(item.description) || null, brand: clean(item.brand) || null, gender: clean(item.gender) || null, status: ["draft", "active", "archived"].includes(clean(item.status)) ? clean(item.status) : "draft" };
      if (productId) {
        const { error } = await supabase.from("products").update(productPayload).eq("id", productId);
        if (error) { errors.push({ name, error: error.message }); continue; }
      } else {
        const { data, error } = await supabase.from("products").insert(productPayload).select("id").single();
        if (error || !data) { errors.push({ name, error: error?.message || "No se pudo crear el producto" }); continue; }
        productId = data.id;
      }

      const optionIds = new Map<string, string>();
      for (const optionName of ["Talle", "Color"] as const) {
        if (!variants.some(variant => clean(optionName === "Talle" ? variant.size : variant.color))) continue;
        const existingOption = await supabase.from("product_options").select("id").eq("product_id", productId).eq("name", optionName).maybeSingle();
        const optionResult = existingOption.data ? { data: existingOption.data, error: null } : await supabase.from("product_options").insert({ product_id: productId, name: optionName }).select("id").single();
        const option = optionResult.data;
        const error = optionResult.error;
        if (error || !option) { if (isNewProduct && productId) await supabase.from("products").delete().eq("id", productId); errors.push({ name, error: error?.message || `No se pudo crear la opción ${optionName}` }); productId = undefined; break; }
        optionIds.set(optionName, option.id);
      }
      if (!productId) continue;

      let variantError = "";
      for (const [index, variant] of variants.entries()) {
        const sku = clean(variant.sku) || `${slug.slice(0, 12).toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
        const price = Number(variant.price);
        const compareAtPrice = clean(variant.compare_at_price) ? Number(variant.compare_at_price) : null;
        const existingVariant = await supabase.from("product_variants").select("id, product_id").eq("sku", sku).maybeSingle();
        if (existingVariant.data && existingVariant.data.product_id !== productId) { variantError = `El SKU ${sku} ya pertenece a otro producto`; break; }
        const hasStock = clean(variant.stock_quantity) !== "";
        const stockQuantity = hasStock ? Number(variant.stock_quantity) : 0;
        if (!Number.isInteger(stockQuantity) || stockQuantity < 0) { variantError = `El stock de ${sku} debe ser un entero mayor o igual a cero`; break; }
        const variantPayload = { product_id: productId, sku, price, compare_at_price: compareAtPrice, stock_quantity: stockQuantity };
        const variantResult = existingVariant.data
          ? await supabase.from("product_variants").update(hasStock ? variantPayload : { product_id: productId, sku, price, compare_at_price: compareAtPrice }).eq("id", existingVariant.data.id).select("id").single()
          : await supabase.from("product_variants").insert(variantPayload).select("id").single();
        if (variantResult.error || !variantResult.data) { variantError = variantResult.error?.message || `No se pudo guardar la variante ${sku}`; break; }
        for (const [optionName, value] of [["Talle", clean(variant.size)], ["Color", clean(variant.color)] as const]) {
          if (!value || !optionIds.has(optionName)) continue;
          const { data: optionValue, error: optionValueError } = await supabase.from("product_option_values").upsert({ option_id: optionIds.get(optionName), value }, { onConflict: "option_id,value" }).select("id").single();
          if (optionValueError || !optionValue) { variantError = optionValueError?.message || "No se pudo guardar el valor de variante"; break; }
          const { error: linkError } = await supabase.from("variant_option_values").upsert({ variant_id: variantResult.data.id, option_value_id: optionValue.id }, { onConflict: "variant_id,option_value_id" });
          if (linkError) { variantError = linkError.message; break; }
        }
        if (variantError) break;
      }
      if (variantError) { if (isNewProduct) await supabase.from("products").delete().eq("id", productId); errors.push({ name, error: variantError }); continue; }

      if (clean(item.image_url)) {
        const { data: image } = await supabase.from("product_images").select("id").eq("product_id", productId).eq("url", clean(item.image_url)).maybeSingle();
        if (!image) await supabase.from("product_images").insert({ product_id: productId, url: clean(item.image_url), alt_text: name });
      }
      for (const collection of selectedCollections.filter(Boolean)) await supabase.from("product_collections").upsert({ product_id: productId, collection_id: collection!.id }, { onConflict: "product_id,collection_id" });
      imported.push({ name, action: existing.data ? "updated" : "created", variants: variants.length });
    }

    return NextResponse.json({ imported, errors, summary: { total: products.length, imported: imported.length, errors: errors.length } }, { status: errors.length && !imported.length ? 400 : 200 });
  } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
}
