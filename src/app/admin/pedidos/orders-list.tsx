"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Order = {
  id: string;
  order_number: number;
  status: string;
  payment_status: string;
  fulfillment_method: string;
  total: number;
  currency: string;
  customer_email: string | null;
  created_at: string;
  customers: { full_name: string }[];
};

const labels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  completed: "Completado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default function OrdersList({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const customerName = order.customers?.[0]?.full_name || "";
      const matchesStatus = filter === "all" || order.status === filter;
      const matchesQuery = !normalizedQuery ||
        `${order.order_number} ${customerName} ${order.customer_email || ""}`.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [filter, orders, query]);
  const hasActiveFilters = query.trim().length > 0 || filter !== "all";

  async function update(id: string, status: string) {
    setUpdatingId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar el pedido");
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
      setMessage(`Pedido #${orders.find((order) => order.id === id)?.order_number} actualizado.`);
    } catch {
      setMessage("No se pudo actualizar el pedido. Probá de nuevo.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="catalog-section">
      <div className="catalog-filters order-filters">
        <input
          aria-label="Buscar pedidos por número o cliente"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por número o cliente"
          type="search"
          value={query}
        />
        <select aria-label="Filtrar pedidos por estado" onChange={(event) => setFilter(event.target.value)} value={filter}>
          <option value="all">Todos los estados</option>
          {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="list-summary" aria-live="polite">
        <span>{filtered.length} {filtered.length === 1 ? "pedido" : "pedidos"}</span>
        {(query || filter !== "all") && (
          <button className="text-button" onClick={() => { setQuery(""); setFilter("all"); }} type="button">
            Limpiar filtros
          </button>
        )}
      </div>
      {message && <p className="notice" role="status">{message}</p>}
      {filtered.length === 0 ? (
        <div className="admin-empty-state">
          <strong>{orders.length === 0 && !hasActiveFilters ? "Todavía no hay pedidos" : "No encontramos pedidos"}</strong>
          <span>{orders.length === 0 && !hasActiveFilters ? "Los pedidos nuevos van a aparecer en esta lista." : "Probá cambiar la búsqueda o limpiar los filtros."}</span>
          {hasActiveFilters && <button className="text-button" onClick={() => { setQuery(""); setFilter("all"); }} type="button">Limpiar búsqueda</button>}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Entrega</th><th>Total</th><th>Estado</th><th>Actualizar</th></tr></thead>
            <tbody>{filtered.map((order) => (
              <tr key={order.id}>
                <td><Link href={`/admin/pedidos/${order.id}`}><strong>#{order.order_number}</strong></Link><small>{new Date(order.created_at).toLocaleString("es-AR")}</small></td>
                <td>{order.customers?.[0]?.full_name || order.customer_email || "—"}</td>
                <td>{order.fulfillment_method}</td>
                <td>{new Intl.NumberFormat("es-AR", { style: "currency", currency: order.currency || "ARS", maximumFractionDigits: 0 }).format(Number(order.total || 0))}</td>
                <td><span className={`status-pill ${order.status}`}>{labels[order.status] || order.status}</span></td>
                <td>
                  <select
                    aria-label={`Actualizar estado del pedido ${order.order_number}`}
                    disabled={updatingId === order.id}
                    onChange={(event) => update(order.id, event.target.value)}
                    value={order.status}
                  >
                    {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  {updatingId === order.id && <small className="field-status">Guardando…</small>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
