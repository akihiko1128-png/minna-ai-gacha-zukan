import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminCookie, adminMaxAge, makeAdminToken } from "../../../../lib/admin-auth";

export async function POST(req: NextRequest) {
  const { key } = await req.json().catch(() => ({ key: "" }));
  const expected = process.env.ADMIN_KEY || "";
  const ok = Boolean(expected && key && Buffer.byteLength(key) === Buffer.byteLength(expected) &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(expected)));

  if (!ok) return NextResponse.json({ error: "管理キーが違います。" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, makeAdminToken(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: adminMaxAge
  });
  return res;
}