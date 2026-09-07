import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../../lib/admin-auth";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import crypto from "crypto";

function ext(name:string) {
  const e = name.toLowerCase().split(".").pop() || "jpg";
  return ["jpg","jpeg","png","webp","gif","avif"].includes(e) ? e : "jpg";
}

export async function PATCH(req:NextRequest, ctx:{params:Promise<{id:string}>}) {
  if (!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id} = await ctx.params;
  const form = await req.formData();
  const title = String(form.get("title") || "");
  const author = String(form.get("author") || "");
  const file = form.get("image");
  const updates:any = {title,author,updated_at:new Date().toISOString()};

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/") || file.size > 10*1024*1024) return NextResponse.json({error:"画像は10MB以下で選択してください。"},{status:400});
    const path = `${crypto.randomUUID()}.${ext(file.name)}`;
    const upload = await supabaseAdmin.storage.from("gacha-images").upload(path, Buffer.from(await file.arrayBuffer()), {contentType:file.type,upsert:false});
    if (upload.error) return NextResponse.json({error:upload.error.message},{status:500});
    const pub = supabaseAdmin.storage.from("gacha-images").getPublicUrl(path).data.publicUrl;
    const old = await supabaseAdmin.from("gachas").select("storage_path").eq("id",id).single();
    if (old.data?.storage_path) await supabaseAdmin.storage.from("gacha-images").remove([old.data.storage_path]);
    updates.image_url = pub;
    updates.storage_path = path;
  }

  const {data,error} = await supabaseAdmin.from("gachas").update(updates).eq("id",id).select().single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({gacha:data});
}

export async function DELETE(_req:NextRequest, ctx:{params:Promise<{id:string}>}) {
  if (!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id} = await ctx.params;
  const old = await supabaseAdmin.from("gachas").select("storage_path").eq("id",id).single();
  if (old.data?.storage_path) await supabaseAdmin.storage.from("gacha-images").remove([old.data.storage_path]);
  const {error} = await supabaseAdmin.from("gachas").delete().eq("id",id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}