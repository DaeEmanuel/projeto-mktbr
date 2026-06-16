"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bold, CheckCircle2, FileText, ImageIcon, Italic, List, SmilePlus, Video } from "lucide-react";
import { calculateWriterNet, formatCurrency, PLATFORM_COMMISSION_CENTS } from "@/lib/money";

type EditableBook = {
  id: string;
  title: string;
  description: string | null;
  synopsis_html?: string | null;
  price_cents: number;
  published: boolean;
  author_name?: string | null;
  category?: string | null;
  short_slug?: string | null;
  slug?: string | null;
};

type UploadKind = "pdf" | "cover" | "video";

const BOOK_SAVE_TIMEOUT_MS = 120_000;
const VIDEO_METADATA_TIMEOUT_MS = 10_000;

const uploadRules = {
  pdf: {
    accept: "application/pdf",
    button: "Selecionar PDF",
    empty: "PDF ate 100 MB",
    error: "Envie um arquivo PDF de ate 100 MB.",
    icon: FileText,
    label: "Ebook em PDF",
    maxSize: 100 * 1024 * 1024,
  },
  cover: {
    accept: "image/png,image/jpeg,image/webp",
    button: "Selecionar Imagem",
    empty: "JPG, PNG ou WEBP ate 10 MB",
    error: "A capa deve ser JPG, PNG ou WEBP e ter ate 10 MB.",
    icon: ImageIcon,
    label: "Capa do livro",
    maxSize: 10 * 1024 * 1024,
  },
  video: {
    accept: "video/mp4",
    button: "Selecionar Video",
    empty: "MP4 ate 200 MB e 5 minutos",
    error: "O video deve ser MP4, ter ate 200 MB e no maximo 5 minutos.",
    icon: Video,
    label: "Video de apresentacao",
    maxSize: 200 * 1024 * 1024,
  },
} as const;

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function centsToInput(cents: number) {
  return (cents / 100).toFixed(2);
}

function parsePrice(value: string) {
  return Math.round(Number(value.replace(",", ".") || 0) * 100);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function validateFileType(file: File, kind: UploadKind) {
  if (kind === "pdf") {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  }

  if (kind === "cover") {
    return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  }

  return file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
}

function UploadField({
  file,
  inputName,
  kind,
  onChange,
  required,
}: {
  file: File | null;
  inputName: string;
  kind: UploadKind;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  const inputId = `${inputName}-input`;
  const rules = uploadRules[kind];
  const Icon = rules.icon;

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-[#128C3E] ring-1 ring-slate-200">
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-700">{rules.label}</p>
          <p className="mt-1 min-h-5 truncate text-xs font-semibold text-slate-500">
            {file ? (
              <span className="inline-flex max-w-full items-center gap-1 text-[#128C3E]">
                <CheckCircle2 size={14} className="shrink-0" />
                <span className="truncate">
                  {file.name} ({formatFileSize(file.size)})
                </span>
              </span>
            ) : (
              rules.empty
            )}
          </p>
        </div>
      </div>

      <input
        id={inputId}
        required={required}
        name={inputName}
        type="file"
        accept={rules.accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      <label
        htmlFor={inputId}
        className="mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-md bg-white px-4 text-center text-sm font-black text-[#061421] ring-1 ring-slate-200 transition hover:ring-[#00c853]"
      >
        {rules.button}
      </label>
    </div>
  );
}

export function BookForm({ book }: { book?: EditableBook }) {
  const router = useRouter();
  const synopsisRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(book?.title || "");
  const [description, setDescription] = useState(book?.description || "");
  const [priceReais, setPriceReais] = useState(book ? centsToInput(book.price_cents) : "");
  const [authorName, setAuthorName] = useState(book?.author_name || "");
  const [category, setCategory] = useState(book?.category || "");
  const [shortSlug, setShortSlug] = useState(book?.short_slug || book?.slug || "");
  const [published, setPublished] = useState(book?.published || false);
  const [message, setMessage] = useState("");
  const [slugMessage, setSlugMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(book?.short_slug || book?.slug));
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const priceCents = parsePrice(priceReais);
  const showNet = priceCents > 0;

  async function checkSlug(value = shortSlug) {
    const slug = normalizeSlug(value);
    setShortSlug(slug);
    if (!slug) {
      setSlugMessage("");
      return true;
    }

    const params = new URLSearchParams({ slug });
    if (book?.id) {
      params.set("bookId", book.id);
    }
    const response = await fetch(`/api/books?${params.toString()}`);
    const data = await response.json();
    setSlugMessage(data.available ? "URL disponivel." : "Esta URL ja esta em uso. Escolha outra.");
    return Boolean(data.available);
  }

  function format(command: "bold" | "italic" | "insertUnorderedList") {
    document.execCommand(command);
    synopsisRef.current?.focus();
  }

  function addEmoji() {
    document.execCommand("insertText", false, " ✨ ");
    synopsisRef.current?.focus();
  }

  async function validateVideo(file: File | null) {
    if (!file) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      const timeout = window.setTimeout(() => {
        URL.revokeObjectURL(url);
        setMessage("Nao foi possivel validar a duracao do video. Tente outro arquivo MP4.");
        console.error("[MKTBR Books] Timeout ao validar metadata do video", {
          name: file.name,
          size: file.size,
          type: file.type,
        });
        resolve(false);
      }, VIDEO_METADATA_TIMEOUT_MS);

      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.clearTimeout(timeout);
        URL.revokeObjectURL(url);
        if (video.duration > 300) {
          setMessage("O video de apresentacao deve ter no maximo 5 minutos.");
          resolve(false);
          return;
        }
        resolve(true);
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        URL.revokeObjectURL(url);
        setMessage("Nao foi possivel validar a duracao do video.");
        console.error("[MKTBR Books] Erro ao validar metadata do video", {
          name: file.name,
          size: file.size,
          type: file.type,
        });
        resolve(false);
      };
      video.src = url;
    });
  }

  async function validateUploads() {
    const uploads: Array<[File | null, UploadKind]> = [
      [ebookFile, "pdf"],
      [coverFile, "cover"],
      [videoFile, "video"],
    ];

    if (!book?.id && !ebookFile) {
      setMessage("Envie o ebook em PDF.");
      return false;
    }

    for (const [file, kind] of uploads) {
      if (!file) {
        continue;
      }

      if (!validateFileType(file, kind) || file.size > uploadRules[kind].maxSize) {
        setMessage(uploadRules[kind].error);
        return false;
      }
    }

    return validateVideo(videoFile);
  }

  async function saveBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setMessage("");

    try {
      console.info("[MKTBR Books] Iniciando salvamento do ebook", {
        mode: book?.id ? "edit" : "create",
        hasPdf: Boolean(ebookFile),
        hasCover: Boolean(coverFile),
        hasVideo: Boolean(videoFile),
      });

      const validUploads = await validateUploads();
      console.info("[MKTBR Books] Validacao local de uploads concluida", { validUploads });

      const availableSlug = await checkSlug();
      console.info("[MKTBR Books] Validacao de URL concluida", { availableSlug, shortSlug });

      if (!validUploads || !availableSlug) {
        return;
      }

      const formData = new FormData(form);
      formData.set("synopsisHtml", synopsisRef.current?.innerHTML || "");
      formData.set("shortSlug", normalizeSlug(shortSlug));
      formData.set("published", String(published));
      if (book?.id) {
        formData.set("bookId", book.id);
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => {
        controller.abort();
      }, BOOK_SAVE_TIMEOUT_MS);

      console.info("[MKTBR Books] Enviando requisicao para /api/books");
      const response = await fetch("/api/books", {
        method: book?.id ? "PATCH" : "POST",
        body: formData,
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));
      console.info("[MKTBR Books] Resposta recebida de /api/books", {
        ok: response.ok,
        status: response.status,
        error: data.error,
      });

      if (!response.ok) {
        setMessage(data.error || "Nao foi possivel salvar o ebook.");
        return;
      }

      setMessage(book?.id ? "Livro publicado com sucesso." : "Livro publicado com sucesso.");
      router.refresh();
      if (!book?.id) {
        form.reset();
        setTitle("");
        setDescription("");
        setPriceReais("");
        setAuthorName("");
        setCategory("");
        setShortSlug("");
        setPublished(false);
        setSlugEdited(false);
        setEbookFile(null);
        setCoverFile(null);
        setVideoFile(null);
        if (synopsisRef.current) {
          synopsisRef.current.innerHTML = "";
        }
      }
    } catch (error) {
      console.error("[MKTBR Books] Falha no salvamento do ebook", error);
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("Tempo limite de upload atingido. Verifique sua conexao e tente novamente.");
        return;
      }

      setMessage("Erro de conexao com banco. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={saveBook} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-xl font-black text-[#061421]">
          {book?.id ? "Editar ebook" : "Cadastrar ebook"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Cadastro gratuito para autores. A cobranca acontece somente quando houver venda.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Titulo do livro
        <input
          required
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugEdited) {
              setShortSlug(normalizeSlug(event.target.value).slice(0, 48));
            }
          }}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        URL personalizada
        <div className="flex min-h-12 overflow-hidden rounded-md border border-slate-200 focus-within:border-[#00c853]">
          <input
            required
            name="shortSlug"
            value={shortSlug}
            onBlur={() => checkSlug()}
            onChange={(event) => {
              setSlugEdited(true);
              setShortSlug(normalizeSlug(event.target.value));
            }}
            className="min-w-0 flex-1 px-4 outline-none"
            placeholder="nomedoebook"
          />
          <span className="grid place-items-center bg-slate-50 px-3 text-xs font-black text-slate-500">
            .mktbr.site
          </span>
        </div>
        {slugMessage ? (
          <span className={`text-xs font-bold ${slugMessage.includes("uso") ? "text-red-600" : "text-[#128C3E]"}`}>
            {slugMessage}
          </span>
        ) : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Nome do autor
          <input
            name="authorName"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Categoria
          <input
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Descricao
        <textarea
          required
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 rounded-md border border-slate-200 p-4 outline-none focus:border-[#00c853]"
        />
      </label>

      <div className="grid gap-2 text-sm font-bold text-slate-700">
        Sinopse
        <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
          <button type="button" onClick={() => format("bold")} className="rounded bg-white p-2 text-[#061421]">
            <Bold size={16} />
          </button>
          <button type="button" onClick={() => format("italic")} className="rounded bg-white p-2 text-[#061421]">
            <Italic size={16} />
          </button>
          <button type="button" onClick={() => format("insertUnorderedList")} className="rounded bg-white p-2 text-[#061421]">
            <List size={16} />
          </button>
          <button type="button" onClick={addEmoji} className="rounded bg-white p-2 text-[#061421]">
            <SmilePlus size={16} />
          </button>
        </div>
        <div
          ref={synopsisRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-36 rounded-md border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-[#00c853]"
          dangerouslySetInnerHTML={{ __html: book?.synopsis_html || "" }}
        />
      </div>

      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Preco de venda em reais
        <input
          required
          name="priceReais"
          type="number"
          min="5.01"
          step="0.01"
          value={priceReais}
          onChange={(event) => setPriceReais(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
        />
        {showNet ? (
          <span className="text-xs font-bold text-slate-600">
            Taxa da plataforma: {formatCurrency(PLATFORM_COMMISSION_CENTS)}
            <br />
            Voce recebera: {formatCurrency(calculateWriterNet(priceCents))} por venda
          </span>
        ) : null}
      </label>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UploadField
          file={ebookFile}
          inputName="ebookFile"
          kind="pdf"
          onChange={setEbookFile}
          required={!book?.id}
        />
        <UploadField
          file={coverFile}
          inputName="coverFile"
          kind="cover"
          onChange={setCoverFile}
        />
        <UploadField
          file={videoFile}
          inputName="videoFile"
          kind="video"
          onChange={setVideoFile}
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
        <input
          name="published"
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
          className="size-4"
        />
        Ativar venda da obra
      </label>

      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#061421] px-5 text-sm font-black text-white disabled:opacity-60"
      >
        {loading ? "Salvando..." : book?.id ? "Salvar ebook" : "Cadastrar ebook"}
      </button>
      {message ? <p className="text-sm font-bold text-slate-700">{message}</p> : null}
    </form>
  );
}
