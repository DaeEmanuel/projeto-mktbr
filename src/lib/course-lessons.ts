import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export type CourseLesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  position: number | null;
};

export async function getPublishedLessonsByCourseSlug(slug: string): Promise<CourseLesson[]> {
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (courseError || !course?.id) return [];

    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, description, video_url, position")
      .eq("course_id", course.id)
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
