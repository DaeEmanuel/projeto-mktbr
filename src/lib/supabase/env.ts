function cleanEnvironmentValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

export function getSupabasePublicConfig() {
  const supabaseUrl = cleanEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = cleanEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase authentication is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(supabaseUrl)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL.");
  }

  const isLegacyJwtKey = supabaseAnonKey.split(".").length === 3;
  const isPublishableKey = supabaseAnonKey.startsWith("sb_publishable_");

  if (!isLegacyJwtKey && !isPublishableKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not a valid Supabase publishable key.");
  }

  return { supabaseUrl, supabaseAnonKey };
}
