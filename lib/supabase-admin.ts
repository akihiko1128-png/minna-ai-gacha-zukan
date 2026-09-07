import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not configured.");
}

export const supabaseAdmin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false }
});