import { NextResponse } from "next/server";
import { getAppBySlug } from "../../../lib/app-context";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("app") || "ai-gacha";
  try {
    const app = await getAppBySlug(slug);
    if (!app || !app.is_public) return NextResponse.json({ error: "図鑑が見つかりません。" }, { status: 404 });
    return NextResponse.json({ settings: app });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "取得に失敗しました。" }, { status: 500 });
  }
}
