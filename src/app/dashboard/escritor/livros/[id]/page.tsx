import Link from "next/link";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/book-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editar Ebook",
};

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: book } = await supabase
    .from("books")
    .select(
      "id, title, description, synopsis_html, price_cents, published, author_name, category, short_slug, slug",
    )
    .eq("id", id)
    .eq("writer_id", user.id)
    .single();

  if (!book) {
    redirect("/dashboard/escritor");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">Ebook</p>
            <h1 className="text-2xl font-black text-[#061421]">Editar ebook</h1>
          </div>
          <Link
            href="/dashboard/escritor"
            className="rounded-md bg-[#061421] px-4 py-2 text-sm font-bold text-white"
          >
            Voltar
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <BookForm book={book} />
      </div>
    </main>
  );
}
