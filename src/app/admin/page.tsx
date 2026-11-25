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

  const [{ count: products }, { count: customers }, { count: pendingOrders }, { data: monthlyOrders }, { data: recentOrders }, { data: inventory }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed", "preparing"]),
    supabase.from("orders").select("total, status").gte("created_at", monthStart.toISOString()),
    supabase.from("orders").select("id, order_number, status, payment_status, fulfillment_method, total, currency, customer_email, created_at, customers(full_name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("inventory").select("quantity, reserved_quantity, product_variants(sku, products(name))").order("updated_at", { ascending: false }).limit(100),
  ]);

  const monthlyRevenue = (monthlyOrders || [])
    .filter((order) => !["cancelled", "refunded"].includes(order.status))
    .reduce((total, order) => total + Number(order.total || 0), 0);
  const lowStock = (inventory || []).map((item) => {
    const variant = relation(item.product_variants);
    const product = relation(variant?.products);
    return { sku: variant?.sku || "Sin SKU", name: product?.name || "Producto", available: Number(item.quantity || 0) - Number(item.reserved_quantity || 0) };
  }).filter((item) => item.available <= 2).slice(0, 6);

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <span className="eyebrow">Resumen operativo</span>
        <h1>El negocio, bajo control.</h1>
        <p>Consultá ventas, pedidos y alertas importantes desde un solo lugar.</p>
      </header>

      <section className="stats dashboard-stats">
        <div><span>Ventas del mes</span><strong>{money.format(monthlyRevenue)}</strong><small>Sin pedidos cancelados</small></div>
        <div><span>Pedidos pendientes</span><strong>{pendingOrders ?? 0}</strong><small>Requieren seguimiento</small></div>
        <div><span>Productos activos</span><strong>{products ?? 0}</strong><small>Disponibles en la tienda</small></div>
        <div><span>Clientes</span><strong>{customers ?? 0}</strong><small>Registrados en el negocio</small></div>
      </section>

      <section className="admin-actions dashboard-actions">
        <Link className="button" href="/admin/ventas">Nueva venta</Link>
        <Link className="button secondary" href="/admin/products/new">Cargar producto</Link>
        <Link className="button secondary" href="/admin/inventario">Actualizar stock</Link>
        <Link className="button secondary" href="/admin/pedidos">Ver pedidos</Link>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-heading"><div><span className="eyebrow">Actividad reciente</span><h2>Últimos pedidos</h2></div><Link href="/admin/pedidos">Ver todos →</Link></div>
          {recentOrders?.length ? <div className="dashboard-orders">{recentOrders.map((order) => { const customer = relation(order.customers); return <Link className="dashboard-order" href={`/admin/pedidos/${order.id}`} key={order.id}><div><strong>#{order.order_number}</strong><span>{customer?.full_name || order.customer_email || "Cliente sin datos"}</span></div><div><b>{money.format(Number(order.total || 0))}</b><span className={`status-pill ${order.status}`}>{statusLabels[order.status] || order.status}</span></div></Link>; })}</div> : <p className="notice">Todavía no hay pedidos registrados.</p>}
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-heading"><div><span className="eyebrow">Inventario</span><h2>Stock bajo</h2></div><Link href="/admin/inventario">Gestionar →</Link></div>
          {lowStock.length ? <div className="dashboard-orders">{lowStock.map((item) => <div className="dashboard-order" key={`${item.sku}-${item.name}`}><div><strong>{item.name}</strong><span>{item.sku}</span></div><b className={item.available <= 0 ? "stock-danger" : "stock-warning"}>{item.available} disponibles</b></div>)}</div> : <p className="notice">No hay alertas de stock bajo.</p>}
        </article>
      </section>

      <p className="notice dashboard-note">El catálogo, las ventas presenciales, los pedidos, el inventario y los clientes comparten la misma información operativa.</p>
    </main>
  );
}
