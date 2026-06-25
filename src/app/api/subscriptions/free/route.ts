import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function activateFreePlan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: null };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  await admin.from("users").upsert(
    {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Usuario MKTBR",
      updated_at: now,
    },
    { onConflict: "id" },
  );

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan_name: "Grátis",
      status: "active",
      subscription_status: "active",
      subscription_plan: "free",
      subscription_start_date: now,
      subscription_end_date: null,
      current_period_end: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  return { user, error };
}

export async function POST() {
  try {
    const { user, error } = await activateFreePlan();

    if (!user) {
      return NextResponse.json({ error: "Faça login ou crie uma conta para ativar o plano grátis." }, { status: 401 });
    }

    if (error) throw error;

    return NextResponse.json({ ok: true, redirectTo: "/meu-painel?plano=grátis" });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel ativar o plano grátis agora." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await activateFreePlan();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/api/subscriptions/free");
      return NextResponse.redirect(loginUrl);
    }

    if (error) throw error;

    return NextResponse.redirect(new URL("/meu-painel?plano=grátis", request.url));
  } catch {
    return NextResponse.redirect(new URL("/planos?plano=grátis&erro=ativacao", request.url));
  }
}
