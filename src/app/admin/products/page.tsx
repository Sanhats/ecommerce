import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductList from "./product-list";

export default async function ProductsPage() {
  const { data: products } = await createAdminClient().from("products").select("id, name, brand, gender, status, created_at, product_variants(id, sku, price)").order("created_at", { ascending: false });
  return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Catálogo</span><h1>Productos</h1><p>Administrá el catálogo, sus estados y variantes.</p></header><div className="admin-actions"><Link className="button" href="/admin/products/new">Nuevo producto</Link><Link className="button secondary" href="/admin/products/import">Importar CSV</Link></div><ProductList products={products || []} /></main>;
}
