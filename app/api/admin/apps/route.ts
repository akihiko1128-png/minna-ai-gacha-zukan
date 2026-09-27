import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { normalizeSlug } from "../../../../lib/app-context";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("apps").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ apps: data || [] });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const slug = normalizeSlug(String(body.slug || name));
  if (!name) return NextResponse.json({ error: "図鑑名を入力してください。" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "URL用ID（slug）を入力してください。" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("apps").insert({
    name,
    slug,
    subtitle: String(body.subtitle || "").trim(),
    description: String(body.description || "").trim(),
    item_name: String(body.item_name || "作品").trim() || "作品",
    item_name_plural: String(body.item_name_plural || body.item_name || "作品").trim() || "作品",
    primary_color: String(body.primary_color || "#111827"),
    show_x_account: body.show_x_account !== false,
    show_creator: body.show_creator !== false,
    show_number: body.show_number !== false,
    is_public: body.is_public !== false,
  }).select().single();

  if (error) {
    const message = error.code === "23505" ? "そのURL用ID（slug）はすでに使われています。" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ app: data });
}
