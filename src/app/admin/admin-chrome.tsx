"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sections = [
  { label: "Inicio", items: [{ label: "Dashboard", href: "/admin", icon: "▦" }] },
  { label: "Ventas", items: [{ label: "Nueva venta", href: "/admin/ventas", icon: "＋" }, { label: "Pedidos", href: "/admin/pedidos", icon: "▤" }, { label: "Clientes", href: "/admin/clientes", icon: "♙" }] },
  { label: "Catálogo", items: [{ label: "Productos", href: "/admin/products", icon: "▣" }, { label: "Categorías", href: "/admin/categorias", icon: "⌂" }, { label: "Colecciones", href: "/admin/colecciones", icon: "◈" }, { label: "Inventario", href: "/admin/inventario", icon: "▥" }] },
];

export default function AdminChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);
  return <div className="admin-app-shell">
    <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
      <div className="admin-brand"><Link href="/admin" onClick={() => setSidebarOpen(false)}><span className="admin-brand-mark">L</span><span><strong>LUNORA</strong><small>CONTROL</small></span></Link><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">×</button></div>
      <div className="admin-store-switch"><span className="store-avatar">L</span><span><b>Showroom Lunora</b><small>Panel de ventas</small></span><span className="store-chevron">⌄</span></div>
      <nav className="admin-nav">{sections.map(section => <div className="admin-nav-section" key={section.label}><span className="admin-nav-label">{section.label}</span>{section.items.map(item => <Link className={isActive(item.href) ? "is-active" : ""} href={item.href} key={item.href} onClick={() => setSidebarOpen(false)}><span className="admin-nav-icon">{item.icon}</span>{item.label}</Link>)}</div>)}</nav>
      <div className="admin-sidebar-bottom"><Link href="/tienda" target="_blank"><span className="admin-nav-icon">↗</span>Ver tienda pública</Link><Link href="/login"><span className="admin-nav-icon">⇥</span>Cerrar sesión</Link></div>
    </aside>
    {sidebarOpen && <button className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Cerrar navegación" />}
    <div className="admin-workspace">
      <header className="admin-topbar"><button className="sidebar-trigger" onClick={() => setSidebarOpen(true)} aria-label="Abrir navegación">☰</button><div className="admin-breadcrumb"><span>Administración</span><b>/</b><strong>{pathname === "/admin" ? "Dashboard" : pathname.includes("products") ? "Productos" : pathname.includes("ventas") ? "Ventas" : pathname.includes("pedidos") ? "Pedidos" : pathname.includes("inventario") ? "Inventario" : "Operaciones"}</strong></div><div className="admin-topbar-actions"><Link href="/tienda" target="_blank">Ver tienda <span>↗</span></Link><button className="admin-notification" aria-label="Notificaciones">♢<i /></button><div className="admin-user"><span>AM</span><b>Admin</b><small>Propietario</small></div></div></header>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}
