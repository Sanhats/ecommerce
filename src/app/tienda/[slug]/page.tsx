import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "./product-detail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("id, name, slug, description, brand, product_images(url, alt_text), product_variants(id, sku, price, compare_at_price, stock_quantity, reserved_quantity, variant_option_values(product_option_values(value, product_options(name))))").eq("slug", slug).eq("status", "active").single();
  if (!product) notFound();
  const { data: relatedProducts } = await supabase.from("products").select("id, name, slug, product_images(url, alt_text), product_variants(price)").eq("status", "active").neq("id", product.id).order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(4);
  return <ProductDetail product={product} relatedProducts={relatedProducts || []} />;
}
