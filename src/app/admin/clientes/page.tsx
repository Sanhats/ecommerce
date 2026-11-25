import { createAdminClient } from "@/lib/supabase/admin";
import CustomersList from "./customers-list";

export default async function CustomersPage() {
  const { data: customers } = await createAdminClient().from("customers").select("id, full_name, email, phone, created_at, orders(id, total, status, created_at)").order("created_at", { ascending: false });
  return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Relaciones</span><h1>Clientes</h1><p>Consultá clientes, pedidos e historial comercial.</p></header><CustomersList customers={customers || []} /></main>;
}
