import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AdminNavigation } from "./admin-navigation";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: memberships } = user
    ? await createAdminClient().from("store_members").select("role").eq("user_id", user.id)
    : { data: [] };
  const roles = (memberships || []).map((membership) => membership.role);
  const accountType = roles.includes("owner") ? "Propietario"
    : roles.includes("admin") ? "Administrador"
    : roles.includes("seller") ? "Vendedor"
    : roles.includes("warehouse") ? "Depósito"
    : "Equipo";

  return (
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <Link aria-label="Lunora, inicio de administración" className="admin-brand" href="/admin">
          <span className="admin-brand-mark" aria-hidden="true">L</span>
          <span><strong>LUNORA</strong><small>GESTIÓN DE TIENDA</small></span>
        </Link>
        <AdminNavigation roles={roles} />
        <div className="admin-sidebar-bottom">
          <span className="admin-user-avatar" aria-hidden="true">{accountType.charAt(0)}</span>
          <span><strong>{accountType}</strong><small>Panel interno</small></span>
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
