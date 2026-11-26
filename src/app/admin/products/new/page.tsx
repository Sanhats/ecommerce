import { createAdminClient } from "@/lib/supabase/admin";
import ProductForm from "./product-form";

export default async function NewProductPage() {
  const { data: categories } = await createAdminClient().from("categories").select("id, name").order("sort_order");
  return <main className="admin-shell admin-form-page admin-product-page"><ProductForm categories={categories || []} /></main>;
}
