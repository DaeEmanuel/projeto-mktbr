import { NextResponse } from "next/server";
import { adminErrorResponse, requireOfficialAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BUCKET = "site-banners";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type BannerPayload = {
  title: string;
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;
  redirect_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  display_order: number;
  is_active: boolean;
  active: boolean;
  position: string;
  image_url?: string | null;
  link_url?: string | null;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function parsePayload(formData: FormData): BannerPayload {
  const title = textValue(formData, "title");
  const redirectUrl = textValue(formData, "redirect_url");
  const startDate = textValue(formData, "start_date");
  const endDate = textValue(formData, "end_date");
  const order = Number(textValue(formData, "display_order") || "0");
  const isActive = textValue(formData, "is_active") === "true";

  if (!title) {
    throw new Error("TITLE_REQUIRED");
  }

  return {
    title,
    redirect_url: redirectUrl || null,
    link_url: redirectUrl || null,
    start_date: nullableDate(startDate),
    end_date: nullableDate(endDate),
    display_order: Number.isFinite(order) ? order : 0,
    is_active: isActive,
    active: isActive,
    position: "home",
  };
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
    DESKTOP_REQUIRED: "Envie a imagem desktop do banner.",
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

export async function GET() {
  try {
    await requireOfficialAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, desktop_image_url, mobile_image_url, image_url, redirect_url, link_url, start_date, end_date, display_order, is_active, active, created_at, updated_at")
      .eq("position", "home")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ banners: data || [] });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOfficialAdmin();
    const formData = await request.formData();
    const payload = parsePayload(formData);
    const desktopFile = formData.get("desktop_image") instanceof File ? (formData.get("desktop_image") as File) : null;
    const mobileFile = formData.get("mobile_image") instanceof File ? (formData.get("mobile_image") as File) : null;

    if (!desktopFile || desktopFile.size === 0) {
      throw new Error("DESKTOP_REQUIRED");
    }

    const folder = crypto.randomUUID();
    const desktopUrl = await uploadImage(desktopFile, folder, "desktop");
    const mobileUrl = await uploadImage(mobileFile, folder, "mobile");

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("banners")
      .insert({
        ...payload,
        desktop_image_url: desktopUrl,
        mobile_image_url: mobileUrl,
        image_url: desktopUrl,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ banner: data, message: "Banner cadastrado com sucesso." });
  } catch (error) {
    return errorResponse(error);
  }
}
