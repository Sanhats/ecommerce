import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => request.cookies.getAll(), setAll: cookies => cookies.forEach(({ name, value, options }) => { response.cookies.set(name, value, options); }) } });
  const { data: { user } } = await supabase.auth.getUser();
  if (request.nextUrl.pathname.startsWith("/api/admin") && !user) return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
  if (request.nextUrl.pathname.startsWith("/admin") && !user) return NextResponse.redirect(new URL("/login", request.url));
  if (user && (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api/admin"))) {
    const admin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: memberships } = await admin.from("store_members").select("role").eq("user_id", user.id);
    const roles = (memberships || []).map(member => member.role);
    if (!roles.length) return request.nextUrl.pathname.startsWith("/api/") ? NextResponse.json({ error: "Usuario sin tienda asignada" }, { status: 403 }) : NextResponse.redirect(new URL("/login?error=sin-tienda", request.url));
    const path = request.nextUrl.pathname;
    const isOwner = roles.includes("owner") || roles.includes("admin");
    const canOperate = isOwner || roles.includes("seller");
    const isInventory = path.includes("inventario") || path.includes("inventory");
    const isOrders = path.includes("pedidos") || path.includes("orders");
    const isCatalog = path.includes("products") || path.includes("variants");
    const isSales = path.includes("ventas") || path.includes("sales");
    const isDashboard = path === "/admin";
    const allowed = isOwner || (canOperate && (isDashboard || isOrders || isCatalog || isSales)) || (roles.includes("warehouse") && (isDashboard || isInventory));
    if (!allowed) return path.startsWith("/api/") ? NextResponse.json({ error: "No tenés permisos para esta operación" }, { status: 403 }) : NextResponse.redirect(new URL("/admin?error=sin-permisos", request.url));
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
