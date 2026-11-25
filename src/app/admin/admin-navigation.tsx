"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "GESTIÓN",
    links: [
      { href: "/admin", label: "Resumen", exact: true },
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/ventas", label: "Ventas presenciales" },
      { href: "/admin/clientes", label: "Clientes" },
    ],
  },
  {
    label: "CATÁLOGO",
    links: [
      { href: "/admin/products", label: "Productos" },
      { href: "/admin/categorias", label: "Categorías" },
      { href: "/admin/colecciones", label: "Colecciones" },
      { href: "/admin/inventario", label: "Inventario" },
    ],
  },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación de administración" className="admin-navigation">
      {groups.map((group) => (
        <div className="admin-nav-group" key={group.label}>
          <p className="admin-nav-label">{group.label}</p>
          {group.links.map((link) => {
            const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`admin-nav-link${active ? " is-active" : ""}`}
                href={link.href}
                key={link.href}
              >
                <span aria-hidden="true" className="admin-nav-mark" />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
