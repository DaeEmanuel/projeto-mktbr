import { NextResponse } from "next/server";
import { adminErrorResponse, requireOfficialAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Params) {
  try {
    await requireOfficialAdmin();
    const { id } = await context.params;
    const supabase = createAdminClient();
    const { data: lesson } = await supabase.from("lessons").select("video_file_path").eq("id", id).maybeSingle();

    if (lesson?.video_file_path) {
      await supabase.storage.from("course-videos").remove([lesson.video_file_path]);
    }

    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Vídeo excluído com sucesso." });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
