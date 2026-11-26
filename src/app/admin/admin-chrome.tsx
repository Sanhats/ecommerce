"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sections = [
  { label: "Inicio", items: [{ label: "Dashboard", href: "/admin", icon: "▦" }] },
  { label: "Ventas", items: [{ label: "Nueva venta", href: "/admin/ventas", icon: "＋" }, { label: "Pedidos", href: "/admin/pedidos", icon: "▤" }, { label: "Clientes", href: "/admin/clientes", icon: "♙" }] },
  { label: "Catálogo", items: [{ label: "Productos", href: "/admin/products", icon: "▣" }, { label: "Categorías", href: "/admin/categorias", icon: "⌂" }, { label: "Colecciones", href: "/admin/colecciones", icon: "◈" }] },
];

export default function AdminChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);
  return <div className="admin-app-shell">
    <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
      <div className="admin-brand"><Link href="/admin" onClick={() => setSidebarOpen(false)}><span className="admin-brand-mark">L</span><span><strong>LUNORA</strong><small>CONTROL</small></span></Link><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">×</button></div>
      <nav className="admin-nav">{sections.map(section => <div className="admin-nav-section" key={section.label}><span className="admin-nav-label">{section.label}</span>{section.items.map(item => <Link className={isActive(item.href) ? "is-active" : ""} href={item.href} key={item.href} onClick={() => setSidebarOpen(false)}><span className="admin-nav-icon">{item.icon}</span>{item.label}</Link>)}</div>)}</nav>
      <div className="admin-sidebar-bottom"><Link href="/tienda" target="_blank"><span className="admin-nav-icon">↗</span>Ver tienda pública</Link><Link href="/login"><span className="admin-nav-icon">⇥</span>Cerrar sesión</Link></div>
    </aside>
    {sidebarOpen && <button className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Cerrar navegación" />}
    <div className="admin-workspace">
      <div className="admin-mobile-bar"><button className="sidebar-trigger" onClick={() => setSidebarOpen(true)} aria-label="Abrir navegación">☰</button><span>Administración</span><Link href="/tienda" target="_blank">Ver tienda ↗</Link></div>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}
