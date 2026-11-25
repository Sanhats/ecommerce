"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  gender: string | null;
  status: string;
  created_at: string;
  product_variants: { id: string; sku: string; price: number }[];
};

const statusLabels: Record<string, string> = { active: "Activo", draft: "Borrador", archived: "Archivado" };

export default function ProductList({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => products.filter((product) =>
    (status === "all" || product.status === status) &&
    `${product.name} ${product.brand || ""} ${product.product_variants.map((variant) => variant.sku).join(" ")}`.toLowerCase().includes(normalizedQuery),
  ), [products, normalizedQuery, status]);
  const hasActiveFilters = Boolean(normalizedQuery) || status !== "all";

  async function archive(id: string) {
    setArchivingId(id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo archivar el producto");
      setProducts((current) => current.map((product) => product.id === id ? { ...product, status: "archived" } : product));
      setMessage("Producto archivado. Ya no aparece en la tienda.");
    } catch {
      setMessage("No se pudo archivar el producto. Probá de nuevo.");
    } finally {
      setArchivingId(null);
    }
  }

  return (
    <section className="catalog-section">
      <div className="catalog-filters">
        <input aria-label="Buscar productos por nombre, marca o SKU" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, marca o SKU" type="search" value={query} />
        <select aria-label="Filtrar productos por estado" onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
      </div>
      <div className="list-summary" aria-live="polite">
        <span>{filtered.length} {filtered.length === 1 ? "producto" : "productos"}</span>
        {(query || status !== "all") && <button className="text-button" onClick={() => { setQuery(""); setStatus("all"); }} type="button">Limpiar filtros</button>}
      </div>
      {message && <p className="notice" role="status">{message}</p>}
      {filtered.length === 0 ? (
        <div className="admin-empty-state">
          <strong>{products.length === 0 && !hasActiveFilters ? "Todavía no hay productos" : "No encontramos productos"}</strong>
          <span>{products.length === 0 && !hasActiveFilters ? "Cargá tu primer producto para empezar a armar el catálogo." : "Probá con otro término o estado, o limpiá los filtros."}</span>
          {hasActiveFilters && <button className="text-button" onClick={() => { setQuery(""); setStatus("all"); }} type="button">Limpiar búsqueda</button>}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Marca</th><th>Variantes</th><th>Precio desde</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{filtered.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong></td>
                <td>{product.brand || "—"}</td>
                <td>{product.product_variants.length}</td>
                <td>{product.product_variants.length ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Math.min(...product.product_variants.map((variant) => variant.price))) : "—"}</td>
                <td><span className={`status-pill ${product.status}`}>{statusLabels[product.status] || product.status}</span></td>
                <td className="actions-cell">
                  <Link className="text-button" href={`/admin/products/${product.id}/edit`}>Editar</Link>
                  {product.status !== "archived" && (
                    <button aria-label={`Archivar ${product.name}`} className="text-button" disabled={archivingId === product.id} onClick={() => archive(product.id)} type="button">
                      {archivingId === product.id ? "Archivando…" : "Archivar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
