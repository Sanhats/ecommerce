import Link from "next/link";
import { AdminNavigation } from "./admin-navigation";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <Link aria-label="Lunora, inicio de administración" className="admin-brand" href="/admin">
          <span className="admin-brand-mark" aria-hidden="true">L</span>
          <span><strong>LUNORA</strong><small>GESTIÓN DE TIENDA</small></span>
        </Link>
        <AdminNavigation />
        <div className="admin-sidebar-bottom">
          <span className="admin-user-avatar" aria-hidden="true">A</span>
          <span><strong>Administración</strong><small>Panel interno</small></span>
        </div>
      </aside>
      <div className="admin-main-column">
        <header className="admin-topbar">
          <div><span className="admin-topbar-kicker">SHOWROOM · TUCUMÁN</span><span className="admin-topbar-title">Centro de operaciones</span></div>
          <Link className="admin-store-link" href="/tienda">Ver tienda <span aria-hidden="true">↗</span></Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
