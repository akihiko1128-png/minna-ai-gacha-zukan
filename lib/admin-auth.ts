import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "gacha_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function sign(value: string) {
  return crypto.createHmac("sha256", process.env.ADMIN_KEY || "").update(value).digest("hex");
}

export function makeAdminToken() {
  const ts = Math.floor(Date.now() / 1000).toString();
  return `${ts}.${sign(ts)}`;
}

export function validToken(token: string | undefined) {
  if (!token || !process.env.ADMIN_KEY) return false;
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return false;
  const age = Math.floor(Date.now() / 1000) - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE) return false;
  const expected = sign(ts);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const store = await cookies();
  return validToken(store.get(COOKIE)?.value);
}

export const adminCookie = COOKIE;
export const adminMaxAge = MAX_AGE;