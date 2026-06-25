import { NextResponse } from "next/server";
import { adminErrorResponse, requireOfficialAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BUCKET = "site-banners";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Params = { params: Promise<{ id: string }> };

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}

async function uploadImage(file: File | null, folder: string, label: string) {
  if (!file || file.size === 0) return null;

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`${label}_INVALID_TYPE`);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`${label}_TOO_LARGE`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
  const objectPath = `${folder}/${label}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`${label}_UPLOAD_FAILED`);
  }

  return supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  const map: Record<string, string> = {
    TITLE_REQUIRED: "Informe o título interno do banner.",
    desktop_INVALID_TYPE: "A imagem desktop deve ser JPG, PNG ou WEBP.",
    mobile_INVALID_TYPE: "A imagem mobile deve ser JPG, PNG ou WEBP.",
    desktop_TOO_LARGE: "A imagem desktop deve ter até 5 MB.",
    mobile_TOO_LARGE: "A imagem mobile deve ter até 5 MB.",
    desktop_UPLOAD_FAILED: "Erro ao enviar a imagem desktop.",
    mobile_UPLOAD_FAILED: "Erro ao enviar a imagem mobile.",
  };

  if (message in map) {
    return NextResponse.json({ error: map[message] }, { status: 400 });
  }

  return adminErrorResponse(error);
}

export async function PATCH(request: Request, context: Params) {
  try {
    await requireOfficialAdmin();
    const { id } = await context.params;
    const formData = await request.formData();
    const action = textValue(formData, "action");
    const supabase = createAdminClient();

    if (action === "toggle") {
      const nextActive = textValue(formData, "is_active") === "true";
      const { data, error } = await supabase
        .from("banners")
        .update({ is_active: nextActive, active: nextActive, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ banner: data, message: nextActive ? "Banner ativado." : "Banner desativado." });
    }

    const title = textValue(formData, "title");
    if (!title) throw new Error("TITLE_REQUIRED");

    const redirectUrl = textValue(formData, "redirect_url");
    const startDate = textValue(formData, "start_date");
    const endDate = textValue(formData, "end_date");
    const displayOrder = Number(textValue(formData, "display_order") || "0");
    const isActive = textValue(formData, "is_active") === "true";
    const desktopFile = formData.get("desktop_image") instanceof File ? (formData.get("desktop_image") as File) : null;
    const mobileFile = formData.get("mobile_image") instanceof File ? (formData.get("mobile_image") as File) : null;
    const folder = id;
    const desktopUrl = await uploadImage(desktopFile, folder, "desktop");
    const mobileUrl = await uploadImage(mobileFile, folder, "mobile");

    const updatePayload: Record<string, unknown> = {
      title,
      redirect_url: redirectUrl || null,
      link_url: redirectUrl || null,
      start_date: nullableDate(startDate),
      end_date: nullableDate(endDate),
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      is_active: isActive,
      active: isActive,
      position: "home",
      updated_at: new Date().toISOString(),
    };

    if (desktopUrl) {
      updatePayload.desktop_image_url = desktopUrl;
      updatePayload.image_url = desktopUrl;
    }

    if (mobileUrl) {
      updatePayload.mobile_image_url = mobileUrl;
    }

    const { data, error } = await supabase.from("banners").update(updatePayload).eq("id", id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ banner: data, message: "Banner atualizado com sucesso." });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    await requireOfficialAdmin();
    const { id } = await context.params;
    const supabase = createAdminClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Banner excluído com sucesso." });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
