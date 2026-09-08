import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data, error } = await supabaseAdmin.from("site_settings").select("title,subtitle,background_url").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data || { title: "みんなのAIガチャ図鑑", subtitle: "AIで作ったカプセルトイ作品を集めました", background_url: "" } });
}
