import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gachas")
    .select("id,display_no,title,author,author_x,image_url")
    .order("display_no", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ gachas: data || [] });
}