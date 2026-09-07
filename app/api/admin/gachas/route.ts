import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function ext(name:string) {
  const e = name.toLowerCase().split(".").pop() || "jpg";
  return ["jpg","jpeg","png","webp","gif","avif"].includes(e) ? e : "jpg";
}

async function nextNo() {
  const { data } = await supabaseAdmin.from("gachas").select("display_no").order("display_no",{ascending:false}).limit(1).maybeSingle();
  return (data?.display_no || 0) + 1;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error:"Unauthorized" },{status:401});
  const { data, error } = await supabaseAdmin.from("gachas").select("*").order("display_no",{ascending:true});
  if (error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({gachas:data||[]});
}

export async function POST(req:NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error:"Unauthorized" },{status:401});
  const form = await req.formData();
  const files = form.getAll("images").filter(v => v instanceof File) as File[];
  const title = String(form.get("title") || "");
  const author = String(form.get("author") || "");
  if (!files.length) return NextResponse.json({error:"画像を1枚以上選択してください。"},{status:400});

  const created = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 10 * 1024 * 1024) continue;
    const path = `${crypto.randomUUID()}.${ext(file.name)}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const upload = await supabaseAdmin.storage.from("gacha-images").upload(path, buf, { contentType:file.type, upsert:false });
    if (upload.error) return NextResponse.json({error:upload.error.message},{status:500});
    const pub = supabaseAdmin.storage.from("gacha-images").getPublicUrl(path).data.publicUrl;
    const display_no = await nextNo();
    const ins = await supabaseAdmin.from("gachas").insert({display_no,title,author,image_url:pub,storage_path:path}).select().single();
    if (ins.error) return NextResponse.json({error:ins.error.message},{status:500});
    created.push(ins.data);
  }
  return NextResponse.json({gachas:created});
}