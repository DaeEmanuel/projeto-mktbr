import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export type HomeBanner = {
  id: string;
  title: string | null;
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;
  image_url?: string | null;
  redirect_url?: string | null;
  link_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  display_order?: number | null;
};

export async function getActiveHomeBanners(): Promise<HomeBanner[]> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, desktop_image_url, mobile_image_url, image_url, redirect_url, link_url, start_date, end_date, display_order")
      .eq("position", "home")
      .eq("active", true)
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
