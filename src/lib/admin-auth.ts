import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const OFFICIAL_ADMIN_EMAIL = "bairropay@gmail.com";

export type AdminCheck = {
  userId: string;
  email: string;
};

export async function requireOfficialAdmin(): Promise<AdminCheck> {
  let user: { id?: string; email?: string } | null = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    throw new Error("UNAUTHENTICATED");
  }

  if (!user?.id || !user.email) {
    throw new Error("UNAUTHENTICATED");
  }

  if (user.email.toLowerCase() !== OFFICIAL_ADMIN_EMAIL) {
    throw new Error("FORBIDDEN");
  }

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from("users")
    .select("id, email, role, blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_LOOKUP_FAILED");
  }

  if (profile?.role !== "admin" || profile.blocked === true) {
    throw new Error("FORBIDDEN");
  }

  return { userId: user.id, email: user.email };
}

export function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";

  if (message === "UNAUTHENTICATED") {
    return Response.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  if (message === "FORBIDDEN") {
    return Response.json({ error: "Apenas o administrador oficial pode gerenciar banners." }, { status: 403 });
  }

  return Response.json({ error: "Não foi possível processar a solicitação agora." }, { status: 500 });
}
