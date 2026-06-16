import { NextResponse } from "next/server";
import {
  normalizeBookSlug,
  parsePriceToCents,
  sanitizeSynopsisHtml,
  suggestBookSlug,
  validateBookPrice,
} from "@/lib/books";
import { PLATFORM_COMMISSION_CENTS } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

const MAX_PDF_SIZE = 100 * 1024 * 1024;
const MAX_COVER_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 90_000;

const videoTypes = new Set(["video/mp4"]);
const coverTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

class BookUploadError extends Error {
  constructor(
    message: string,
    public readonly publicMessage: string,
  ) {
    super(message);
  }
}

function timeout<T>(promise: Promise<T>, message: string) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), UPLOAD_TIMEOUT_MS);
    }),
  ]);
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName) {
    return fromName.toLowerCase();
  }

  return file.type.split("/").pop() || "bin";
}

async function uploadOptionalFile({
  bucket,
  errorMessage,
  file,
  userId,
  prefix,
}: {
  bucket: "book-assets" | "ebook-files";
  errorMessage: string;
  file: File | null;
  userId: string;
  prefix: string;
}) {
  if (!file || file.size === 0) {
    return null;
  }

  const supabase = await createClient();
  const path = `${userId}/${prefix}-${crypto.randomUUID()}.${fileExtension(file)}`;
  console.info("[MKTBR Books API] Iniciando upload", {
    bucket,
    path,
    prefix,
    size: file.size,
    type: file.type,
  });

  const { error } = await timeout(
    supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    }),
    `Timeout no upload ${prefix}`,
  );

  if (error) {
    console.error("[MKTBR Books API] Erro no upload", { bucket, path, error });
    throw new BookUploadError(error.message, errorMessage);
  }

  console.info("[MKTBR Books API] Upload concluido", { bucket, path });

  if (bucket === "book-assets") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  }

  return { path, publicUrl: null };
}

async function assertSlugAvailable(slug: string, bookId?: string) {
  const supabase = await createClient();
  const query = supabase
    .from("books")
    .select("id")
    .or(`slug.eq.${slug},short_slug.eq.${slug}`)
    .limit(1);

  const { data, error } = bookId ? await query.neq("id", bookId) : await query;

  if (error) {
    throw new Error(error.message);
  }

  return !data?.length;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const rawSlug = searchParams.get("slug") || suggestBookSlug(title);
  const slug = normalizeBookSlug(rawSlug);

  if (!slug) {
    return NextResponse.json({ available: false, slug: "" });
  }

  const available = await assertSlugAvailable(slug, searchParams.get("bookId") || undefined);
  return NextResponse.json({ available, slug });
}

export async function POST(request: Request) {
  console.info("[MKTBR Books API] POST /api/books iniciado");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const synopsisHtml = sanitizeSynopsisHtml(String(formData.get("synopsisHtml") || ""));
  const authorName = String(formData.get("authorName") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const shortSlug = normalizeBookSlug(String(formData.get("shortSlug") || title));
  const priceCents = parsePriceToCents(formData.get("priceReais"));
  const published = String(formData.get("published") || "false") === "true";
  const ebookFile = formData.get("ebookFile") as File | null;
  const coverFile = formData.get("coverFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  if (!title || !description || !synopsisHtml || !validateBookPrice(priceCents) || !ebookFile) {
    return NextResponse.json(
      { error: "Informe titulo, descricao, sinopse, preco acima de R$ 5,00 e PDF do ebook." },
      { status: 400 },
    );
  }

  if (ebookFile.type !== "application/pdf") {
    return NextResponse.json({ error: "O ebook deve ser enviado em PDF." }, { status: 400 });
  }

  if (ebookFile.size > MAX_PDF_SIZE) {
    return NextResponse.json({ error: "O PDF deve ter ate 100 MB." }, { status: 400 });
  }

  if (!/^[a-z0-9-]+$/.test(shortSlug)) {
    return NextResponse.json(
      { error: "A URL deve usar apenas letras minusculas, numeros e hifen." },
      { status: 400 },
    );
  }

  if (!(await assertSlugAvailable(shortSlug))) {
    return NextResponse.json(
      { error: "Esta URL ja esta em uso. Escolha outra." },
      { status: 409 },
    );
  }

  if (coverFile && coverFile.size > 0 && !coverTypes.has(coverFile.type)) {
    return NextResponse.json({ error: "A capa deve ser JPG, PNG ou WebP." }, { status: 400 });
  }

  if (coverFile && coverFile.size > MAX_COVER_SIZE) {
    return NextResponse.json({ error: "A capa deve ter ate 10 MB." }, { status: 400 });
  }

  if (videoFile && videoFile.size > 0 && !videoTypes.has(videoFile.type)) {
    return NextResponse.json({ error: "O video deve ser MP4." }, { status: 400 });
  }

  if (videoFile && videoFile.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "O video deve ter ate 200 MB." }, { status: 400 });
  }

  try {
    const [ebookUpload, coverUpload, videoUpload] = await Promise.all([
      uploadOptionalFile({
        bucket: "ebook-files",
        errorMessage: "Erro ao enviar PDF.",
        file: ebookFile,
        userId: user.id,
        prefix: "ebook",
      }),
      uploadOptionalFile({
        bucket: "book-assets",
        errorMessage: "Erro ao enviar capa.",
        file: coverFile,
        userId: user.id,
        prefix: "cover",
      }),
      uploadOptionalFile({
        bucket: "book-assets",
        errorMessage: "Erro ao enviar video.",
        file: videoFile,
        userId: user.id,
        prefix: "video",
      }),
    ]);

    console.info("[MKTBR Books API] Inserindo livro no banco");
    const { data, error } = await supabase
      .from("books")
      .insert({
        writer_id: user.id,
        slug: shortSlug,
        short_slug: shortSlug,
        title,
        description,
        synopsis_html: synopsisHtml,
        author_name: authorName || user.user_metadata?.name || user.email,
        category,
        price_cents: priceCents,
        cover_url: coverUpload?.publicUrl,
        video_url: videoUpload?.publicUrl,
        video_file_path: videoUpload?.path,
        ebook_file_path: ebookUpload?.path,
        ebook_file_name: ebookFile.name,
        published,
      })
      .select("id, slug, short_slug")
      .single();

    if (error) {
      console.error("[MKTBR Books API] Erro ao inserir livro no banco", error);
      return NextResponse.json({ error: "Erro de conexao com banco." }, { status: 500 });
    }

    console.info("[MKTBR Books API] Livro salvo com sucesso", { id: data.id });
    return NextResponse.json({
      book: data,
      platformFeeCents: PLATFORM_COMMISSION_CENTS,
    });
  } catch (error) {
    console.error("[MKTBR Books API] Falha no POST /api/books", error);
    return NextResponse.json(
      {
        error:
          error instanceof BookUploadError
            ? error.publicMessage
            : error instanceof Error && error.message.includes("Timeout")
              ? "Tempo limite de upload atingido. Tente novamente."
              : "Erro de conexao com banco.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  console.info("[MKTBR Books API] PATCH /api/books iniciado");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const bookId = String(formData.get("bookId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const synopsisHtml = sanitizeSynopsisHtml(String(formData.get("synopsisHtml") || ""));
  const authorName = String(formData.get("authorName") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const shortSlug = normalizeBookSlug(String(formData.get("shortSlug") || title));
  const priceCents = parsePriceToCents(formData.get("priceReais"));
  const published = String(formData.get("published") || "false") === "true";
  const ebookFile = formData.get("ebookFile") as File | null;
  const coverFile = formData.get("coverFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  if (!bookId || !title || !description || !synopsisHtml || !validateBookPrice(priceCents)) {
    return NextResponse.json(
      { error: "Informe titulo, descricao, sinopse e preco acima de R$ 5,00." },
      { status: 400 },
    );
  }

  const { data: currentBook } = await supabase
    .from("books")
    .select("id, ebook_file_path")
    .eq("id", bookId)
    .eq("writer_id", user.id)
    .single();

  if (!currentBook) {
    return NextResponse.json({ error: "Livro nao encontrado." }, { status: 404 });
  }

  if (!(await assertSlugAvailable(shortSlug, bookId))) {
    return NextResponse.json(
      { error: "Esta URL ja esta em uso. Escolha outra." },
      { status: 409 },
    );
  }

  if (!currentBook.ebook_file_path && (!ebookFile || ebookFile.size === 0)) {
    return NextResponse.json({ error: "Envie o PDF do ebook." }, { status: 400 });
  }

  if (ebookFile && ebookFile.size > 0 && ebookFile.type !== "application/pdf") {
    return NextResponse.json({ error: "O ebook deve ser enviado em PDF." }, { status: 400 });
  }

  if (ebookFile && ebookFile.size > MAX_PDF_SIZE) {
    return NextResponse.json({ error: "O PDF deve ter ate 100 MB." }, { status: 400 });
  }

  if (coverFile && coverFile.size > 0 && !coverTypes.has(coverFile.type)) {
    return NextResponse.json({ error: "A capa deve ser JPG, PNG ou WebP." }, { status: 400 });
  }

  if (coverFile && coverFile.size > MAX_COVER_SIZE) {
    return NextResponse.json({ error: "A capa deve ter ate 10 MB." }, { status: 400 });
  }

  if (videoFile && videoFile.size > 0 && !videoTypes.has(videoFile.type)) {
    return NextResponse.json({ error: "O video deve ser MP4." }, { status: 400 });
  }

  if (videoFile && videoFile.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "O video deve ter ate 200 MB." }, { status: 400 });
  }

  try {
    const [ebookUpload, coverUpload, videoUpload] = await Promise.all([
      uploadOptionalFile({
        bucket: "ebook-files",
        errorMessage: "Erro ao enviar PDF.",
        file: ebookFile,
        userId: user.id,
        prefix: "ebook",
      }),
      uploadOptionalFile({
        bucket: "book-assets",
        errorMessage: "Erro ao enviar capa.",
        file: coverFile,
        userId: user.id,
        prefix: "cover",
      }),
      uploadOptionalFile({
        bucket: "book-assets",
        errorMessage: "Erro ao enviar video.",
        file: videoFile,
        userId: user.id,
        prefix: "video",
      }),
    ]);

    const update: Record<string, string | number | boolean | null> = {
      slug: shortSlug,
      short_slug: shortSlug,
      title,
      description,
      synopsis_html: synopsisHtml,
      author_name: authorName || user.user_metadata?.name || user.email || "Autor MKTBR",
      category,
      price_cents: priceCents,
      published,
      updated_at: new Date().toISOString(),
    };

    if (ebookUpload?.path) {
      update.ebook_file_path = ebookUpload.path;
      update.ebook_file_name = ebookFile?.name || "ebook.pdf";
    }
    if (coverUpload?.publicUrl) {
      update.cover_url = coverUpload.publicUrl;
    }
    if (videoUpload?.publicUrl) {
      update.video_url = videoUpload.publicUrl;
      update.video_file_path = videoUpload.path;
    }

    console.info("[MKTBR Books API] Atualizando livro no banco", { bookId });
    const { data, error } = await supabase
      .from("books")
      .update(update)
      .eq("id", bookId)
      .eq("writer_id", user.id)
      .select("id, slug, short_slug")
      .single();

    if (error) {
      console.error("[MKTBR Books API] Erro ao atualizar livro no banco", error);
      return NextResponse.json({ error: "Erro de conexao com banco." }, { status: 500 });
    }

    console.info("[MKTBR Books API] Livro atualizado com sucesso", { id: data.id });
    return NextResponse.json({ book: data });
  } catch (error) {
    console.error("[MKTBR Books API] Falha no PATCH /api/books", error);
    return NextResponse.json(
      {
        error:
          error instanceof BookUploadError
            ? error.publicMessage
            : error instanceof Error && error.message.includes("Timeout")
              ? "Tempo limite de upload atingido. Tente novamente."
              : "Erro de conexao com banco.",
      },
      { status: 500 },
    );
  }
}
