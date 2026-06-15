import Link from "next/link";
import { BookCheckoutButton } from "@/components/book-checkout-button";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatCurrency } from "@/lib/money";
import { sampleBooks } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Book = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  slug: string;
  users?: { name: string | null } | null;
};

export const metadata = {
  title: "Livros",
  description:
    "Marketplace de livros digitais com autores independentes e entrega digital segura.",
};

export default async function LivrosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("id, title, description, price_cents, slug, users:writer_id(name)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const books = (data || []) as unknown as Book[];

  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="MARKETPLACE DE LIVROS"
        title="Descubra Novos Autores e Obras Exclusivas"
        text="Explore livros digitais publicados por escritores independentes de todo o Brasil. Encontre histórias inspiradoras, conteúdos educativos e obras criadas por autores que compartilham conhecimento, experiências e criatividade."
      >
        <div className="mb-8 rounded-lg border border-[#00c853]/30 bg-[#00c853]/10 p-5">
          <p className="font-black text-[#061421]">
            ✓ Compra segura • Entrega digital imediata • Apoio direto aos autores
          </p>
        </div>

        {books.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {books.map((book) => (
              <article key={book.id} className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-xs font-black uppercase tracking-wide text-[#00c853]">
                  {book.users?.name || "Escritor MKTBR"}
                </p>
                <h2 className="mt-3 text-xl font-black">{book.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{book.description}</p>
                <p className="mt-5 text-2xl font-black">{formatCurrency(book.price_cents)}</p>
                <div className="mt-5">
                  <BookCheckoutButton bookId={book.id} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {sampleBooks.map((book) => (
              <article key={book.id} className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-xs font-black uppercase tracking-wide text-[#00c853]">
                  Exemplo
                </p>
                <h2 className="mt-3 text-xl font-black">{book.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{book.description}</p>
                <p className="mt-5 text-2xl font-black">{formatCurrency(book.priceCents)}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">
                  Cadastre livros reais no painel do escritor para vender via Stripe.
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/dashboard/escritor"
            className="inline-flex min-h-12 items-center rounded-md bg-[#061421] px-5 text-sm font-black text-white"
          >
            Painel do escritor
          </Link>
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
