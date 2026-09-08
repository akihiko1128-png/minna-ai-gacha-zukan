import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import crypto from "crypto";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data || { id: 1, title: "みんなのAIガチャ図鑑", subtitle: "", background_url: "", background_path: null } });
}
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const subtitle = String(form.get("subtitle") || "").trim();
  const background = form.get("background");
  const { data: current } = await supabaseAdmin.from("site_settings").select("background_path").eq("id", 1).maybeSingle();
  const update: Record<string, string | number | null> = { id: 1, title, subtitle };
  let newPath: string | null = null;
  if (background instanceof File && background.size > 0) {
    if (!background.type.startsWith("image/")) return NextResponse.json({ error: "背景には画像を選択してください。" }, { status: 400 });
    if (background.size > 10 * 1024 * 1024) return NextResponse.json({ error: "背景画像は10MB以下にしてください。" }, { status: 400 });
    const ext = background.name.toLowerCase().split(".").pop() || "jpg";
    newPath = `site-background/${crypto.randomUUID()}.${ext}`;
    const upload = await supabaseAdmin.storage.from("gacha-images").upload(newPath, Buffer.from(await background.arrayBuffer()), { contentType: background.type, upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
    update.background_url = supabaseAdmin.storage.from("gacha-images").getPublicUrl(newPath).data.publicUrl;
    update.background_path = newPath;
  }
  const { data, error } = await supabaseAdmin.from("site_settings").upsert(update, { onConflict: "id" }).select().single();
  if (error) {
    if (newPath) await supabaseAdmin.storage.from("gacha-images").remove([newPath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (newPath && current?.background_path) await supabaseAdmin.storage.from("gacha-images").remove([current.background_path]);
  return NextResponse.json({ settings: data });
}
