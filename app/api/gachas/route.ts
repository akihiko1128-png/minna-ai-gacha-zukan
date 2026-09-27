import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { getAppBySlug } from "../../../lib/app-context";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("app") || "ai-gacha";
  try {
    const app = await getAppBySlug(slug);
    if (!app || !app.is_public) {
      return NextResponse.json({ error: "図鑑が見つかりません。" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("gachas")
      .select("id,display_no,title,author,author_x,image_url")
      .eq("app_id", app.id)
      .order("display_no", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ gachas: data || [], app });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "取得に失敗しました。" }, { status: 500 });
  }
}
