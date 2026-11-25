import { createAdminClient } from "@/lib/supabase/admin";
import InventoryForm from "./inventory-form";

export default async function InventoryPage() {
  const supabase = createAdminClient();
  const [{ data: stores }, { data: locations }, { data: variants }, { data: inventory }] = await Promise.all([
    supabase.from("stores").select("id, name").order("name"),
    supabase.from("locations").select("id, store_id, name, type").order("name"),
    supabase.from("product_variants").select("id, product_id, sku, price, products!inner(id, name, store_id)").order("sku"),
    supabase.from("inventory").select("variant_id, location_id, quantity, reserved_quantity, product_variants!inner(sku, products!inner(name)), locations!inner(name, type)").order("updated_at", { ascending: false }),
  ]);
  return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Operaciones</span><h1>Inventario por ubicación</h1><p>Elegí el producto y la ubicación para ajustar existencias rápidamente.</p></header><InventoryForm stores={stores || []} locations={locations || []} variants={variants || []} inventory={inventory || []} /></main>;
}
