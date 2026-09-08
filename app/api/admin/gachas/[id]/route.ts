import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../../lib/admin-auth";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import crypto from "crypto";

function ext(name: string) {
  const e = name.toLowerCase().split(".").pop() || "jpg";
  return ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(e) ? e : "jpg";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const author = String(form.get("author") || "").trim();
  const author_x = String(form.get("author_x") || "").trim();
  const image = form.get("image");

  const { data: current, error: currentError } = await supabaseAdmin.from("gachas").select("*").eq("id", id).single();
  if (currentError || !current) return NextResponse.json({ error: "対象が見つかりません。" }, { status: 404 });

  const update: Record<string, string> = { title, author, author_x };
  let newPath: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) return NextResponse.json({ error: "画像ファイルを選択してください。" }, { status: 400 });
    if (image.size > 10 * 1024 * 1024) return NextResponse.json({ error: "画像は10MB以下にしてください。" }, { status: 400 });
    newPath = `${crypto.randomUUID()}.${ext(image.name)}`;
    const upload = await supabaseAdmin.storage.from("gacha-images").upload(newPath, Buffer.from(await image.arrayBuffer()), { contentType: image.type, upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
    update.image_url = supabaseAdmin.storage.from("gacha-images").getPublicUrl(newPath).data.publicUrl;
    update.storage_path = newPath;
  }

  const { data, error } = await supabaseAdmin.from("gachas").update(update).eq("id", id).select().single();
  if (error) {
    if (newPath) await supabaseAdmin.storage.from("gacha-images").remove([newPath]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (newPath && current.storage_path) await supabaseAdmin.storage.from("gacha-images").remove([current.storage_path]);
  return NextResponse.json({ gacha: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data: current, error: currentError } = await supabaseAdmin.from("gachas").select("storage_path").eq("id", id).single();
  if (currentError || !current) return NextResponse.json({ error: "対象が見つかりません。" }, { status: 404 });
  const { error } = await supabaseAdmin.from("gachas").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (current.storage_path) await supabaseAdmin.storage.from("gacha-images").remove([current.storage_path]);
  return NextResponse.json({ ok: true });
}
