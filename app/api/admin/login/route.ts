import { NextRequest, NextResponse } from "next/server";
import { adminCookie, adminMaxAge, makeAdminToken } from "../../../../lib/admin-auth";

export async function POST(req: NextRequest) {
  const { key } = await req.json().catch(() => ({ key: "" }));
  if (!process.env.ADMIN_KEY || typeof key !== "string" || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "管理キーが違います。" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, makeAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: adminMaxAge,
  });
  return res;
}
