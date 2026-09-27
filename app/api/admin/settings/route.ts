import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { getAppBySlug } from "../../../../lib/app-context";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("app") || "ai-gacha";
  const app = await getAppBySlug(slug);
  if (!app) return NextResponse.json({ error: "図鑑が見つかりません。" }, { status: 404 });
  return NextResponse.json({ settings: app });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("app") || "ai-gacha";
  const app = await getAppBySlug(slug);
  if (!app) return NextResponse.json({ error: "図鑑が見つかりません。" }, { status: 404 });

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const subtitle = String(form.get("subtitle") || "").trim();
  const description = String(form.get("description") || "").trim();
  const item_name = String(form.get("item_name") || "作品").trim() || "作品";
  const item_name_plural = String(form.get("item_name_plural") || item_name).trim() || item_name;
  const primary_color = String(form.get("primary_color") || "#111827").trim() || "#111827";
  const show_x_account = String(form.get("show_x_account") || "true") === "true";
  const show_creator = String(form.get("show_creator") || "true") === "true";
  const show_number = String(form.get("show_number") || "true") === "true";
  const background = form.get("background");
  const logo = form.get("logo");

  const update: Record<string, string | boolean> = {
    name: title,
    subtitle,
    description,
    item_name,
    item_name_plural,
    primary_color,
    show_x_account,
    show_creator,
    show_number,
  };

  if (background instanceof File && background.size > 0) {
    if (!background.type.startsWith("image/")) return NextResponse.json({ error: "背景には画像を選択してください。" }, { status: 400 });
    if (background.size > 10 * 1024 * 1024) return NextResponse.json({ error: "背景画像は10MB以下にしてください。" }, { status: 400 });
    const ext = background.name.toLowerCase().split(".").pop() || "jpg";
    const path = `site-background/${app.id}-${crypto.randomUUID()}.${ext}`;
    const upload = await supabaseAdmin.storage.from("gacha-images").upload(path, Buffer.from(await background.arrayBuffer()), { contentType: background.type, upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
    update.background_url = supabaseAdmin.storage.from("gacha-images").getPublicUrl(path).data.publicUrl;
  }

  if (logo instanceof File && logo.size > 0) {
    if (!logo.type.startsWith("image/")) return NextResponse.json({ error: "ロゴには画像を選択してください。" }, { status: 400 });
    if (logo.size > 10 * 1024 * 1024) return NextResponse.json({ error: "ロゴ画像は10MB以下にしてください。" }, { status: 400 });
    const ext = logo.name.toLowerCase().split(".").pop() || "png";
    const path = `site-logo/${app.id}-${crypto.randomUUID()}.${ext}`;
    const upload = await supabaseAdmin.storage.from("gacha-images").upload(path, Buffer.from(await logo.arrayBuffer()), { contentType: logo.type, upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
    update.logo_url = supabaseAdmin.storage.from("gacha-images").getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await supabaseAdmin.from("apps").update(update).eq("id", app.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
