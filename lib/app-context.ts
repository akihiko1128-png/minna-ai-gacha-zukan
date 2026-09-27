import { supabaseAdmin } from "./supabase-admin";

export type AppConfig = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  logo_url: string;
  background_url: string;
  primary_color: string;
  item_name: string;
  item_name_plural: string;
  show_x_account: boolean;
  show_creator: boolean;
  show_number: boolean;
  is_public: boolean;
};

export async function getAppBySlug(slug = "ai-gacha") {
  const clean = slug.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .from("apps")
    .select("*")
    .eq("slug", clean)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AppConfig | null) || null;
}

export async function getDefaultApp() {
  return getAppBySlug("ai-gacha");
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}
