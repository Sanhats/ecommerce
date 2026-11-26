import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const statusLabels: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmado", preparing: "Preparando", shipped: "Enviado", completed: "Completado", cancelled: "Cancelado", refunded: "Reintegrado" };

function relation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage() {
  const supabase = createAdminClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ count: products }, { count: customers }, { count: pendingOrders }, { data: monthlyOrders }, { data: recentOrders }, { data: variants }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed", "preparing"]),
    supabase.from("orders").select("total, status").gte("created_at", monthStart.toISOString()),
    supabase.from("orders").select("id, order_number, status, payment_status, fulfillment_method, total, currency, customer_email, created_at, customers(full_name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("product_variants").select("sku, stock_quantity, reserved_quantity, products(name)").order("updated_at", { ascending: false }).limit(100),
  ]);

  const monthlyRevenue = (monthlyOrders || [])
    .filter((order) => !["cancelled", "refunded"].includes(order.status))
    .reduce((total, order) => total + Number(order.total || 0), 0);
  const lowStock = (variants || []).map((variant) => {
    const product = relation(variant.products);
    return { sku: variant.sku || "Sin SKU", name: product?.name || "Producto", available: Number(variant.stock_quantity || 0) - Number(variant.reserved_quantity || 0) };
  }).filter((item) => item.available <= 2).slice(0, 6);

  return (
    <main className="admin-shell">
      <section className="stats dashboard-stats">
        <div><span>Ventas del mes</span><strong>{money.format(monthlyRevenue)}</strong><small>Sin pedidos cancelados</small></div>
        <div><span>Pedidos pendientes</span><strong>{pendingOrders ?? 0}</strong><small>Requieren seguimiento</small></div>
        <div><span>Productos activos</span><strong>{products ?? 0}</strong><small>Disponibles en la tienda</small></div>
        <div><span>Clientes</span><strong>{customers ?? 0}</strong><small>Registrados en el negocio</small></div>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-heading"><div><span className="eyebrow">Actividad reciente</span><h2>Últimos pedidos</h2></div></div>
          {recentOrders?.length ? <div className="dashboard-orders">{recentOrders.map((order) => { const customer = relation(order.customers); return <Link className="dashboard-order" href={`/admin/pedidos/${order.id}`} key={order.id}><div><strong>#{order.order_number}</strong><span>{customer?.full_name || order.customer_email || "Cliente sin datos"}</span></div><div><b>{money.format(Number(order.total || 0))}</b><span className={`status-pill ${order.status}`}>{statusLabels[order.status] || order.status}</span></div></Link>; })}</div> : <p className="notice">Todavía no hay pedidos registrados.</p>}
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-heading"><div><span className="eyebrow">Productos</span><h2>Stock bajo</h2></div></div>
          {lowStock.length ? <div className="dashboard-orders">{lowStock.map((item) => <div className="dashboard-order" key={`${item.sku}-${item.name}`}><div><strong>{item.name}</strong><span>{item.sku}</span></div><b className={item.available <= 0 ? "stock-danger" : "stock-warning"}>{item.available} disponibles</b></div>)}</div> : <p className="notice">No hay alertas de stock bajo.</p>}
        </article>
      </section>

    </main>
  );
}
