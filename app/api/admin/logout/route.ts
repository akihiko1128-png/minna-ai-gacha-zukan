import { NextResponse } from "next/server";
import { adminCookie } from "../../../../lib/admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, "", { httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", path:"/", maxAge:0 });
  return res;
}