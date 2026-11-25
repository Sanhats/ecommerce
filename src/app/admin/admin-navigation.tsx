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

export function AdminNavigation({ roles }: { roles: string[] }) {
  const pathname = usePathname();
  const isOwner = roles.includes("owner") || roles.includes("admin");
  const canOpen = (href: string) => roles.length === 0 || isOwner ||
    (roles.includes("seller") && ["/admin", "/admin/pedidos", "/admin/ventas", "/admin/products"].includes(href)) ||
    (roles.includes("warehouse") && ["/admin", "/admin/inventario"].includes(href));
  const visibleGroups = groups
    .map((group) => ({ ...group, links: group.links.filter((link) => canOpen(link.href)) }))
    .filter((group) => group.links.length > 0);

  return (
    <nav aria-label="Navegación de administración" className="admin-navigation">
      {visibleGroups.map((group) => (
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
