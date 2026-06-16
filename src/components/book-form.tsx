"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bold, Italic, List, SmilePlus } from "lucide-react";
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
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (video.duration > 300) {
          setMessage("O video de apresentacao deve ter no maximo 5 minutos.");
          resolve(false);
          return;
        }
        resolve(true);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        setMessage("Nao foi possivel validar a duracao do video.");
        resolve(false);
      };
      video.src = url;
    });
  }

  async function saveBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const videoFile = (form.elements.namedItem("videoFile") as HTMLInputElement).files?.[0] || null;
    const validVideo = await validateVideo(videoFile);
    const availableSlug = await checkSlug();

    if (!validVideo || !availableSlug) {
      setLoading(false);
      return;
    }

    const formData = new FormData(form);
    formData.set("synopsisHtml", synopsisRef.current?.innerHTML || "");
    formData.set("shortSlug", normalizeSlug(shortSlug));
    formData.set("published", String(published));
    if (book?.id) {
      formData.set("bookId", book.id);
    }

    const response = await fetch("/api/books", {
      method: book?.id ? "PATCH" : "POST",
      body: formData,
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel salvar o ebook.");
      return;
    }

    setMessage(book?.id ? "Ebook atualizado com sucesso." : "Ebook cadastrado com sucesso.");
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
      if (synopsisRef.current) {
        synopsisRef.current.innerHTML = "";
      }
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

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Ebook em PDF
          <input
            required={!book?.id}
            name="ebookFile"
            type="file"
            accept="application/pdf"
            className="rounded-md border border-slate-200 p-3 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Capa do livro
          <input
            name="coverFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="rounded-md border border-slate-200 p-3 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Video de apresentacao
          <input
            name="videoFile"
            type="file"
            accept="video/mp4,video/webm"
            className="rounded-md border border-slate-200 p-3 text-sm"
          />
          <span className="text-xs font-semibold text-slate-500">Maximo de 5 minutos.</span>
        </label>
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
