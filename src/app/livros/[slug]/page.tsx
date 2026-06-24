import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCheckoutButton } from "@/components/book-checkout-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Book = {
  id: string;
  title: string;
  description: string | null;
  synopsis_html: string | null;
  author_name: string | null;
  category: string | null;
  cover_url: string | null;
  video_url: string | null;
  price_cents: number;
  slug: string;
  short_slug: string | null;
  users?: { name: string | null } | null;
};

async function getBook(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select(
      "id, title, description, synopsis_html, author_name, category, cover_url, video_url, price_cents, slug, short_slug, users:writer_id(name)",
    )
    .eq("published", true)
    .or(`slug.eq.${slug},short_slug.eq.${slug}`)
    .maybeSingle();

  return data as unknown as Book | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBook(slug);

  return {
    title: book ? `${book.title} | MKTBR Livros` : "Ebook",
    description: book?.description || "Ebook publicado na MKTBR Site.",
  };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    notFound();
  }

  const publicSlug = book.short_slug || book.slug;
  const authorName = book.author_name || book.users?.name || "Autor MKTBR";

  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_url}
                alt={`Capa do ebook ${book.title}`}
                className="aspect-[3/4] w-full rounded-lg border border-slate-200 bg-white object-cover"
              />
            ) : (
              <div className="grid aspect-[3/4] place-items-center rounded-lg border border-slate-200 bg-white p-8 text-center">
                <p className="text-2xl font-black text-[#061421]">{book.title}</p>
              </div>
            )}
            {book.video_url ? (
              <video
                src={book.video_url}
                controls
                className="w-full rounded-lg border border-slate-200 bg-black"
              />
            ) : null}
          </div>

          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-wide text-[#00c853]">
              {book.category || "Ebook digital"}
            </p>
            <h1 className="mt-3 text-3xl font-black text-[#061421] sm:text-4xl">{book.title}</h1>
            <p className="mt-3 text-sm font-bold text-slate-500">Por {authorName}</p>
            <p className="mt-2 text-xs font-bold text-[#128C3E]">{publicSlug}.mktbr.site</p>

            <div className="mt-6">
              <h2 className="text-lg font-black text-[#061421]">Sinopse</h2>
              <div
                className="mt-3 space-y-3 text-sm leading-7 text-slate-700 [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-black"
                dangerouslySetInnerHTML={{ __html: book.synopsis_html || "" }}
              />
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-black text-[#061421]">Descricao</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{book.description}</p>
            </div>

            <div className="mt-8 rounded-lg bg-slate-50 p-5">
              <p className="text-3xl font-black text-[#061421]">{formatCurrency(book.price_cents)}</p>
              <div className="mt-4">
                <BookCheckoutButton bookId={book.id} />
              </div>
            </div>

            <Link href="/livros" className="mt-6 inline-flex text-sm font-black text-[#128C3E]">
              Ver outros ebooks
            </Link>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
