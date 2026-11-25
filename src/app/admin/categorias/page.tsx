import { createAdminClient } from "@/lib/supabase/admin";
import CategoryForm from "./category-form";
export default async function CategoriesPage() { const { data: categories } = await createAdminClient().from("categories").select("id, name, slug, description").order("sort_order"); return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Catálogo</span><h1>Categorías</h1><p>Organizá las prendas para facilitar la navegación del showroom.</p></header><CategoryForm categories={categories || []} /></main>; }
