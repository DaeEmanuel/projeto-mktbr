import Link from "next/link";
import { redirect } from "next/navigation";
import { BookForm } from "@/components/book-form";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Sale = {
  id: string;
  sale_amount_cents: number;
  platform_commission_cents: number;
  writer_net_cents: number;
  buyer_email: string | null;
  sold_at: string;
  status: string;
  books?: { title: string | null } | null;
};

type Payout = {
  id: string;
  amount_cents: number;
  status: string;
  payout_reference: string | null;
  created_at: string;
};

export const metadata = {
  title: "Painel do Escritor",
};

export default async function WriterDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: salesData }, { data: payoutsData }, { data: booksData }] = await Promise.all([
    supabase
      .from("book_sales")
      .select(
        "id, sale_amount_cents, platform_commission_cents, writer_net_cents, buyer_email, sold_at, status, books(title)",
      )
      .eq("writer_id", user.id)
      .order("sold_at", { ascending: false }),
    supabase
      .from("writer_payouts")
      .select("id, amount_cents, status, payout_reference, created_at")
      .eq("writer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("books")
      .select("id, title, price_cents, published, short_slug, slug")
      .eq("writer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const sales = (salesData || []) as unknown as Sale[];
  const payouts = (payoutsData || []) as unknown as Payout[];
  const totalSold = sales.reduce((sum, sale) => sum + sale.sale_amount_cents, 0);
  const platformCommission = sales.reduce(
    (sum, sale) => sum + sale.platform_commission_cents,
    0,
  );
  const writerNet = sales.reduce((sum, sale) => sum + sale.writer_net_cents, 0);

  const metrics = [
    { label: "Total vendido", value: formatCurrency(totalSold) },
    { label: "Quantidade de vendas", value: String(sales.length) },
    { label: "Comissao do MKTBR", value: formatCurrency(platformCommission) },
    { label: "Valor liquido do escritor", value: formatCurrency(writerNet) },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
              Escritor
            </p>
            <h1 className="text-2xl font-black text-[#061421]">Painel do escritor</h1>
            <p className="mt-1 text-sm text-slate-500">
              Cadastro gratuito. Voce so paga taxa da plataforma quando vender uma obra.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-md bg-[#061421] px-4 py-2 text-sm font-bold text-white">
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold text-slate-500">{metric.label}</p>
              <p className="mt-3 text-2xl font-black text-[#061421]">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <BookForm />
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-[#061421]">Meus livros</h2>
            <div className="mt-4 grid gap-3">
              {(booksData || []).map((book) => (
                <div key={book.id} className="rounded-md bg-slate-50 p-4">
                  <p className="font-black">{book.title}</p>
                  <p className="text-sm text-slate-600">
                    {formatCurrency(book.price_cents)} - {book.published ? "Venda ativa" : "Venda inativa"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#128C3E]">
                    {(book.short_slug || book.slug)}.mktbr.site
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/escritor/livros/${book.id}`}
                      className="rounded-md bg-white px-3 py-2 text-xs font-black text-[#061421] ring-1 ring-slate-200"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/livros/${book.short_slug || book.slug}`}
                      className="rounded-md bg-white px-3 py-2 text-xs font-black text-[#128C3E] ring-1 ring-slate-200"
                    >
                      Ver pagina publica
                    </Link>
                  </div>
                </div>
              ))}
              {(booksData || []).length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum livro cadastrado ainda.</p>
              ) : null}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-[#061421]">Historico de pagamentos</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-3">Livro</th>
                  <th>Comprador</th>
                  <th>Venda</th>
                  <th>Comissao</th>
                  <th>Liquido</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-t border-slate-100">
                    <td className="py-3 font-bold">{sale.books?.title || "Livro"}</td>
                    <td>{sale.buyer_email || "Comprador"}</td>
                    <td>{formatCurrency(sale.sale_amount_cents)}</td>
                    <td>{formatCurrency(sale.platform_commission_cents)}</td>
                    <td>{formatCurrency(sale.writer_net_cents)}</td>
                    <td>{new Date(sale.sold_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sales.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Nenhuma venda registrada.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-[#061421]">Repasses</h2>
          <div className="mt-4 grid gap-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="rounded-md bg-slate-50 p-4">
                <p className="font-black">{formatCurrency(payout.amount_cents)}</p>
                <p className="text-sm text-slate-600">
                  Status: {payout.status} {payout.payout_reference ? `- ${payout.payout_reference}` : ""}
                </p>
              </div>
            ))}
            {payouts.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum repasse gerado ainda.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
