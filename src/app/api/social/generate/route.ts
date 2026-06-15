import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const freeLimits = {
  post: { table: "generated_posts", limit: 3 },
  image: { table: "generated_images", limit: 2 },
  analysis: { table: "profile_analysis", limit: 1 },
} as const;

type LimitedFeature = keyof typeof freeLimits;

function monthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const feature = String(body.feature || "post");
  const prompt = String(body.prompt || "").trim();
  const result = String(body.result || "").trim();

  if (!prompt || !result) {
    return NextResponse.json({ error: "Informe um briefing valido." }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("social_plan, social_status")
    .eq("user_id", user.id)
    .maybeSingle();

  const socialPlan = subscription?.social_plan || "free";
  const hasPaidAccess =
    subscription?.social_status === "active" && ["pro", "premium"].includes(socialPlan);

  if (!hasPaidAccess && feature in freeLimits) {
    const limitedFeature = feature as LimitedFeature;
    const limit = freeLimits[limitedFeature];
    const { count } = await supabase
      .from(limit.table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStartIso());

    if ((count || 0) >= limit.limit) {
      return NextResponse.json(
        { error: "Limite mensal do plano gratuito atingido." },
        { status: 403 },
      );
    }
  }

  if (feature === "image") {
    await supabase.from("generated_images").insert({
      user_id: user.id,
      prompt,
      status: "draft",
    });
  } else if (feature === "analysis") {
    await supabase.from("profile_analysis").insert({
      user_id: user.id,
      profile_url: prompt,
      summary: result,
      recommendations: [],
    });
  } else if (feature === "calendar") {
    await supabase.from("content_calendar").insert({
      user_id: user.id,
      title: prompt.slice(0, 120),
      planned_for: new Date().toISOString().slice(0, 10),
      caption: result,
      status: "planned",
    });
  } else {
    await supabase.from("generated_posts").insert({
      user_id: user.id,
      prompt,
      content: result,
      platform: feature === "bio" ? "bio-profissional" : "social",
      status: "draft",
    });
  }

  return NextResponse.json({ result });
}
