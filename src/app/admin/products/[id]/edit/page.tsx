import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import EditProductForm from "./edit-product-form";
import CategorySelect from "./category-select";
import FeaturedToggle from "./featured-toggle";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: product }, { data: categories }] = await Promise.all([supabase.from("products").select("id, category_id, is_featured, name, description, brand, gender, status, product_images(id, url, alt_text, variant_id), product_variants(id, sku, price, compare_at_price, stock_quantity, reserved_quantity, is_active, variant_option_values(product_option_values(value, product_options(name))))").eq("id", id).single(), supabase.from("categories").select("id, name").order("sort_order")]);
  if (!product) notFound();
  return <main className="admin-shell"><header className="admin-header"><h1>Editar producto</h1></header><div className="edit-product-controls"><CategorySelect productId={product.id} currentCategory={product.category_id} categories={categories || []} /><FeaturedToggle productId={product.id} initial={product.is_featured} /></div><EditProductForm product={product} categories={categories || []} /></main>;
}
