import { createAdminClient } from "@/lib/supabase/admin";
import CategoryForm from "./category-form";
export default async function CategoriesPage() { const { data: categories } = await createAdminClient().from("categories").select("id, name, slug, description").order("sort_order"); return <main className="admin-shell"><CategoryForm categories={categories || []} /></main>; }
