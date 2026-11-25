import { createAdminClient } from "@/lib/supabase/admin";
import ProductForm from "./product-form";

export default async function NewProductPage() {
  const { data: categories } = await createAdminClient().from("categories").select("id, name").order("sort_order");
  return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Catálogo</span><h1>Nuevo producto</h1><p>Creá el producto y su primera variante comercial.</p></header><ProductForm categories={categories || []} /></main>;
}
