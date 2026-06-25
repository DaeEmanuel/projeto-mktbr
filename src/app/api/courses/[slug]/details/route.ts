import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

type LessonRow = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  position: number | null;
  published: boolean | null;
  video_file_path: string | null;
};

function isPaidActiveSubscription(subscription?: { status?: string | null; subscription_status?: string | null; subscription_plan?: string | null; plan_name?: string | null } | null) {
  const status = subscription?.subscription_status || subscription?.status;
  const plan = (subscription?.subscription_plan || subscription?.plan_name || "").toLowerCase();
  return (status === "active" || status === "trialing") && !["free", "grátis", "grátis"].includes(plan);
}

async function hasCourseAccess(userId: string, course: { id: string; slug: string; title: string }) {
  const supabase = createAdminClient();
  const [{ data: profile }, { data: subscription }, { data: orders }, { data: enrollment }] = await Promise.all([
    supabase.from("users").select("role, blocked").eq("id", userId).maybeSingle(),
    supabase.from("subscriptions").select("status, subscription_status, subscription_plan, plan_name").eq("user_id", userId).maybeSingle(),
    supabase
      .from("orders")
      .select("product_id, product_name, payment_status")
      .eq("buyer_id", userId)
      .in("payment_status", ["Pagamento Confirmado", "paid"])
      .limit(50),
    supabase.from("enrollments").select("id, status").eq("user_id", userId).eq("course_id", course.id).maybeSingle(),
  ]);

  if (profile?.role === "admin" && profile.blocked !== true) return true;
  if (isPaidActiveSubscription(subscription)) return true;
  if (enrollment?.status === "active") return true;

  return Boolean(
    orders?.some((order) =>
      order.product_id === course.id ||
      order.product_id === course.slug ||
      order.product_name?.toLowerCase() === course.title.toLowerCase(),
    ),
  );
}

async function signLessonVideo(path: string | null) {
  if (!path) return null;
  const { data, error } = await createAdminClient().storage.from("course-videos").createSignedUrl(path, 60 * 30);
  if (error) return null;
  return data.signedUrl;
}

export async function GET(_request: Request, context: Params) {
  try {
    const { slug } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Faça login para ver os detalhes do curso." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: course, error: courseError } = await admin
      .from("courses")
      .select("id, slug, title, description, level, category, price_cents, published, created_at, cover_url")
      .eq("slug", slug)
      .maybeSingle();

    if (courseError) throw courseError;
    if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });

    const access = await hasCourseAccess(user.id, course);
    const { data: lessons, error: lessonsError } = await admin
      .from("lessons")
      .select("id, title, description, duration_seconds, position, published, video_file_path")
      .eq("course_id", course.id)
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (lessonsError) throw lessonsError;

    const hydratedLessons = await Promise.all(
      ((lessons || []) as LessonRow[]).map(async (lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration_seconds: lesson.duration_seconds,
        position: lesson.position,
        status: access ? "disponível" : "bloqueada",
        video_url: access ? await signLessonVideo(lesson.video_file_path) : null,
      })),
    );

    return NextResponse.json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        category: course.category || "Cursos Online",
        type: "Curso",
        price_cents: course.price_cents || 0,
        published_at: course.created_at,
        cover_url: course.cover_url,
        author_name: "Equipe MKTBR",
        author_bio: "Especialistas em educação digital, marketing e produtos online.",
      },
      access: access ? "Acesso liberado" : "Não adquirido",
      canWatch: access,
      lessons: hydratedLessons,
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os detalhes do curso agora." }, { status: 500 });
  }
}
