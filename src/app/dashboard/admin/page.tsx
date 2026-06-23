import Link from "next/link";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Sale = {
  id: string;
  book_id: string;
  writer_id: string;
  sale_amount_cents: number;
  platform_commission_cents: number;
  writer_net_cents: number;
  buyer_email: string | null;
  sold_at: string;
  books?: { title: string | null } | null;
};

type Payout = {
  id: string;
  writer_id: string;
  amount_cents: number;
  status: string;
  payout_reference: string | null;
  created_at: string;
};

type Order = {
  id: string;
  purchase_code: string;
  product_name: string;
  author_id: string | null;
  amount: number;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
};

export const metadata = {
  title: "Painel Administrativo",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-2xl font-black text-[#061421]">Acesso administrativo</h1>
          <p className="mt-3 text-slate-600">
            Apenas usuarios com role admin podem acessar este painel.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[#061421] px-4 text-sm font-black text-white"
          >
            Voltar
          </Link>
        </section>
      </main>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  const [{ data: salesData }, { data: payoutsData }, { data: ordersData }] = await Promise.all([
    supabase
      .from("book_sales")
      .select(
        "id, book_id, writer_id, sale_amount_cents, platform_commission_cents, writer_net_cents, buyer_email, sold_at, books(title)",
      )
      .order("sold_at", { ascending: false }),
    supabase
      .from("writer_payouts")
      .select("id, writer_id, amount_cents, status, payout_reference, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, purchase_code, product_name, author_id, amount, payment_status, paid_at, created_at")
      .eq("payment_status", "Pagamento Confirmado")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const sales = (salesData || []) as unknown as Sale[];
  const payouts = (payoutsData || []) as unknown as Payout[];
  const orders = (ordersData || []) as unknown as Order[];
  const salesToday = orders.filter((order) => new Date(order.paid_at || order.created_at) >= todayStart);
  const monthOrders = orders.filter((order) => new Date(order.paid_at || order.created_at) >= monthStart);
  const dailyRevenue = salesToday.reduce((sum, order) => sum + order.amount, 0);
  const monthlyRevenue = monthOrders.reduce((sum, order) => sum + order.amount, 0);
  const latestOrder = orders[0];
  const totalCommissions = sales.reduce(
    (sum, sale) => sum + sale.platform_commission_cents,
    0,
  );

  const bookCounts = [...sales.reduce((map, sale) => {
    const title = sale.books?.title || sale.book_id;
    map.set(title, (map.get(title) || 0) + 1);
    return map;
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1]);

  const writerTotals = [...sales.reduce((map, sale) => {
    map.set(sale.writer_id, (map.get(sale.writer_id) || 0) + sale.sale_amount_cents);
    return map;
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1]);

  const metrics = [
    { label: "Total arrecadado em comissoes", value: formatCurrency(totalCommissions) },
    { label: "Vendas hoje", value: String(salesToday.length) },
    { label: "Faturamento do dia", value: formatCurrency(dailyRevenue) },
    { label: "Receita mensal", value: formatCurrency(monthlyRevenue) },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">Admin</p>
            <h1 className="text-2xl font-black text-[#061421]">Painel do administrador</h1>
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


        <section className="rounded-lg border border-[#00c853]/30 bg-[#00c853]/10 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#128C3E]">Novas Compras</p>
          <h2 className="mt-1 text-xl font-black text-[#061421]">Resumo de confirmações automáticas</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-md bg-white p-4"><p className="text-sm font-bold text-slate-500">Vendas hoje</p><p className="mt-2 text-2xl font-black">{salesToday.length}</p></div>
            <div className="rounded-md bg-white p-4"><p className="text-sm font-bold text-slate-500">Faturamento do dia</p><p className="mt-2 text-2xl font-black">{formatCurrency(dailyRevenue)}</p></div>
            <div className="rounded-md bg-white p-4"><p className="text-sm font-bold text-slate-500">Última venda</p><p className="mt-2 text-sm font-black">{latestOrder?.product_name || "Nenhuma venda"}</p></div>
            <div className="rounded-md bg-white p-4"><p className="text-sm font-bold text-slate-500">Autor responsável</p><p className="mt-2 truncate text-sm font-black">{latestOrder?.author_id || "-"}</p></div>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-[#061421]">Livros mais vendidos</h2>
            <div className="mt-4 grid gap-3">
              {bookCounts.map(([title, count]) => (
                <div key={title} className="flex justify-between rounded-md bg-slate-50 p-4">
                  <span className="font-bold">{title}</span>
                  <span>{count} vendas</span>
                </div>
              ))}
              {bookCounts.length === 0 ? <p className="text-sm text-slate-500">Sem vendas.</p> : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-[#061421]">Escritores mais vendidos</h2>
            <div className="mt-4 grid gap-3">
              {writerTotals.map(([writerId, total]) => (
                <div key={writerId} className="rounded-md bg-slate-50 p-4">
                  <p className="font-bold">{writerId}</p>
                  <p className="text-sm text-slate-600">{formatCurrency(total)} vendidos</p>
                </div>
              ))}
              {writerTotals.length === 0 ? <p className="text-sm text-slate-500">Sem vendas.</p> : null}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-[#061421]">Relatorio financeiro</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-3">Livro</th>
                  <th>Comprador</th>
                  <th>Venda</th>
                  <th>Comissao MKTBR</th>
                  <th>Liquido escritor</th>
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
            {sales.length === 0 ? <p className="py-4 text-sm text-slate-500">Sem vendas.</p> : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-[#061421]">Controle de repasses</h2>
          <div className="mt-4 grid gap-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="rounded-md bg-slate-50 p-4">
                <p className="font-black">{formatCurrency(payout.amount_cents)}</p>
                <p className="text-sm text-slate-600">
                  Escritor: {payout.writer_id} - Status: {payout.status}
                </p>
              </div>
            ))}
            {payouts.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum repasse registrado.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
