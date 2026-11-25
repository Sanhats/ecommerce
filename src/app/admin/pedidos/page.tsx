import { createAdminClient } from "@/lib/supabase/admin";
import OrdersList from "./orders-list";

export default async function OrdersPage() {
  const { data: orders } = await createAdminClient().from("orders").select("id, order_number, status, payment_status, fulfillment_method, total, currency, customer_email, created_at, customers(full_name)").order("created_at", { ascending: false });
  return <main className="admin-shell"><header className="admin-header"><span className="eyebrow">Operaciones</span><h1>Pedidos</h1><p>Seguí cada pedido desde la recepción hasta su cierre.</p></header><OrdersList orders={orders || []} /></main>;
}
