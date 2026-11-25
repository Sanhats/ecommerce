import { createAdminClient } from "@/lib/supabase/admin";
import CollectionForm from "./collection-form";
export default async function CollectionsPage() { const { data: collections } = await createAdminClient().from("collections").select("id, name, slug, description, is_active").order("created_at", { ascending: false }); return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Catálogo</span><h1>Colecciones</h1><p>Armá grupos comerciales para temporadas, campañas y favoritos.</p></header><CollectionForm collections={collections || []} /></main>; }
