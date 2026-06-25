import { NextResponse } from "next/server";
import { adminErrorResponse, requireOfficialAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BUCKET = "course-videos";
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const TEST_COURSE_SLUG = "curso-teste-mktbr";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function ensureTestCourse() {
  const supabase = createAdminClient();
  const { data: course, error } = await supabase
    .from("courses")
    .upsert(
      {
        slug: TEST_COURSE_SLUG,
        title: "Curso de Teste MKTBR",
        description: "Ambiente de teste para validar player, upload de vídeo e experiência de aula antes da publicação oficial.",
        level: "teste",
        published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id, slug, title")
    .single();

  if (error) throw error;

  const { data: module } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", course.id)
    .eq("title", "Aulas de teste")
    .maybeSingle();

  if (!module) {
    await supabase.from("modules").insert({
      course_id: course.id,
      title: "Aulas de teste",
      position: 0,
    });
  }

  return course;
}

async function getDefaultModule(courseId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

async function uploadVideo(file: File, courseId: string) {
  if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) {
    throw new Error("INVALID_VIDEO_TYPE");
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error("VIDEO_TOO_LARGE");
  }

  const objectPath = `${courseId}/${crypto.randomUUID()}.mp4`;
  const bytes = await file.arrayBuffer();
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: "video/mp4",
    upsert: false,
  });

  if (error) throw new Error("VIDEO_UPLOAD_FAILED");
  return {
    path: objectPath,
    publicUrl: supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl,
  };
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  const map: Record<string, string> = {
    TITLE_REQUIRED: "Informe o título do vídeo.",
    COURSE_REQUIRED: "Selecione um curso para vincular o vídeo.",
    VIDEO_REQUIRED: "Envie um vídeo MP4 para continuar.",
    INVALID_VIDEO_TYPE: "O vídeo deve estar em formato MP4.",
    VIDEO_TOO_LARGE: "O vídeo deve ter até 200 MB.",
    VIDEO_UPLOAD_FAILED: "Erro ao enviar o vídeo. Tente novamente.",
  };

  if (message in map) {
    return NextResponse.json({ error: map[message] }, { status: 400 });
  }

  return adminErrorResponse(error);
}

export async function GET() {
  try {
    await requireOfficialAdmin();
    await ensureTestCourse();
    const supabase = createAdminClient();
    const [{ data: courses, error: coursesError }, { data: lessons, error: lessonsError }] = await Promise.all([
      supabase.from("courses").select("id, slug, title").order("created_at", { ascending: false }).limit(100),
      supabase
        .from("lessons")
        .select("id, course_id, title, description, video_url, video_file_path, position, published, updated_at, courses:course_id(title, slug)")
        .not("video_url", "is", null)
        .order("updated_at", { ascending: false })
        .limit(50),
    ]);

    if (coursesError) throw coursesError;
    if (lessonsError) throw lessonsError;
    return NextResponse.json({ courses: courses || [], lessons: lessons || [] });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOfficialAdmin();
    const formData = await request.formData();
    const lessonId = textValue(formData, "lesson_id");
    const courseId = textValue(formData, "course_id");
    const title = textValue(formData, "title");
    const description = textValue(formData, "description");
    const file = formData.get("video") instanceof File ? (formData.get("video") as File) : null;

    if (!title) throw new Error("TITLE_REQUIRED");
    if (!courseId) throw new Error("COURSE_REQUIRED");
    if (!lessonId && (!file || file.size === 0)) throw new Error("VIDEO_REQUIRED");

    const upload = file && file.size > 0 ? await uploadVideo(file, courseId) : null;
    const supabase = createAdminClient();
    const moduleId = await getDefaultModule(courseId);
    const payload: Record<string, unknown> = {
      course_id: courseId,
      module_id: moduleId,
      title,
      description: description || null,
      published: true,
      position: 0,
      updated_at: new Date().toISOString(),
    };

    if (upload) {
      payload.video_url = upload.publicUrl;
      payload.video_file_path = upload.path;
    }

    const query = lessonId
      ? supabase.from("lessons").update(payload).eq("id", lessonId)
      : supabase.from("lessons").insert(payload);

    const { data, error } = await query.select("id, course_id, title, description, video_url, video_file_path, position, published, updated_at, courses:course_id(title, slug)").single();
    if (error) throw error;

    return NextResponse.json({ lesson: data, message: lessonId ? "Vídeo substituído com sucesso." : "Vídeo enviado com sucesso." });
  } catch (error) {
    return errorResponse(error);
  }
}
