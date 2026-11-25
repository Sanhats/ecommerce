import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "./product-detail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: product } = await (await createClient()).from("products").select("id, name, slug, description, brand, product_images(url, alt_text), product_variants(id, sku, price, compare_at_price, variant_option_values(product_option_values(value, product_options(name))))").eq("slug", slug).eq("status", "active").single();
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
