import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({ ok: false, service: "supabase", error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, service: "supabase", products: count ?? 0 });
  } catch {
    return NextResponse.json({ ok: false, service: "supabase", error: "Supabase environment is not configured" }, { status: 500 });
  }
}
