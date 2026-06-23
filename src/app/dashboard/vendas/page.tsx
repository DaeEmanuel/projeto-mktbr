import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, Download, Package, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { SalesRealtimeNotice } from "@/components/sales-realtime-notice";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendas",
};

type SalesPageProps = {
  searchParams?: Promise<{ range?: string }>;
};

type Order = {
  id: string;
  purchase_code: string;
  product_name: string;
  product_type: string;
  buyer_name: string | null;
  buyer_email: string | null;
  amount: number;
  payment_method: string;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
};

const ranges = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "month", label: "Este mês" },
  { id: "year", label: "Este ano" },
];

function getRangeStart(range: string) {
  const now = new Date();
  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "7d") {
    start.setDate(now.getDate() - 7);
    return start;
  }

  if (range === "30d") {
    start.setDate(now.getDate() - 30);
    return start;
  }

  if (range === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function isConfirmed(order: Order) {
  return order.payment_status === "Pagamento Confirmado";
}

function sumOrders(orders: Order[]) {
  return orders.reduce((total, order) => total + (isConfirmed(order) ? order.amount : 0), 0);
}

function getTopProducts(orders: Order[]) {
  const map = new Map<string, { name: string; count: number; revenue: number }>();
  orders.filter(isConfirmed).forEach((order) => {
    const current = map.get(order.product_name) || { name: order.product_name, count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += order.amount;
    map.set(order.product_name, current);
  });

  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams;
  const range = ranges.some((item) => item.id === params?.range) ? params?.range || "30d" : "30d";
  const startDate = getRangeStart(range);
  const todayStart = getRangeStart("today");
  const monthStart = getRangeStart("month");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: subscription }, { data }] = await Promise.all([
    supabase.from("subscriptions").select("status, plan_name").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, purchase_code, product_name, product_type, buyer_name, buyer_email, amount, payment_method, payment_status, paid_at, created_at")
      .eq("author_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const orders = (data || []) as Order[];
  const confirmed = orders.filter(isConfirmed);
  const totalRevenue = sumOrders(orders);
  const dailyRevenue = sumOrders(orders.filter((order) => new Date(order.created_at) >= todayStart));
  const monthlyRevenue = sumOrders(orders.filter((order) => new Date(order.created_at) >= monthStart));
  const avgTicket = confirmed.length > 0 ? Math.round(totalRevenue / confirmed.length) : 0;
  const topProducts = getTopProducts(orders);
  const activeRange = ranges.find((item) => item.id === range)?.label || "Últimos 30 dias";

  return (
    <DashboardShell user={user} subscription={subscription}>
      <SalesRealtimeNotice userId={user.id} />

      <section className="rounded-[1.5rem] bg-[#05281f] p-6 text-white shadow-2xl sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#83f5aa]">Histórico financeiro</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">Vendas</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
              Acompanhe compras confirmadas, receita, clientes e produtos com uma visão profissional para sua operação digital.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["csv", "excel", "pdf"].map((format) => (
              <Link
                key={format}
                href={`/api/sales/export?format=${format}&range=${range}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/18"
              >
                <Download size={16} />
                Exportar {format === "csv" ? "CSV" : format === "excel" ? "Excel" : "PDF"}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {ranges.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/vendas?range=${item.id}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
              item.id === range ? "bg-[#00c853] text-[#05281f]" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#05281f]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Receita total", value: formatCurrency(totalRevenue), icon: TrendingUp },
          { label: "Receita mensal", value: formatCurrency(monthlyRevenue), icon: CalendarDays },
          { label: "Receita diária", value: formatCurrency(dailyRevenue), icon: CalendarDays },
          { label: "Quantidade de vendas", value: String(confirmed.length), icon: Package },
          { label: "Ticket médio", value: formatCurrency(avgTicket), icon: BarChart3 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-[1.25rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <Icon className="text-[#00a843]" size={22} />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-[#061421]">{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00a843]">{activeRange}</p>
              <h2 className="mt-1 text-2xl font-black text-[#061421]">Histórico de vendas</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#05281f] text-white">
                <tr>
                  <th className="px-5 py-4">Código da compra</th>
                  <th>Produto</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Método</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-black text-[#061421]">{order.purchase_code}</td>
                    <td className="font-bold text-[#061421]">{order.product_name}</td>
                    <td>
                      <p className="font-semibold text-[#061421]">{order.buyer_name || "Cliente MKTBR"}</p>
                      <p className="text-xs text-slate-500">{order.buyer_email || "E-mail não informado"}</p>
                    </td>
                    <td className="font-black">{formatCurrency(order.amount)}</td>
                    <td>{order.payment_method}</td>
                    <td>{new Date(order.paid_at || order.created_at).toLocaleString("pt-BR")}</td>
                    <td className={isConfirmed(order) ? "font-black text-[#128C3E]" : "font-black text-amber-600"}>{order.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 ? (
            <p className="p-5 text-sm leading-6 text-slate-500">Nenhuma venda encontrada para o período selecionado.</p>
          ) : null}
        </div>

        <aside className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00a843]">Top produtos</p>
          <h2 className="mt-1 text-2xl font-black text-[#061421]">Mais vendidos</h2>
          <div className="mt-5 grid gap-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className="rounded-2xl bg-[#f4f8f3] p-4">
                <p className="text-xs font-black text-[#00a843]">#{index + 1}</p>
                <p className="mt-1 font-black text-[#061421]">{product.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {product.count} venda(s) · {formatCurrency(product.revenue)}
                </p>
              </div>
            ))}
            {topProducts.length === 0 ? <p className="text-sm leading-6 text-slate-500">Os produtos aparecerão aqui assim que as vendas forem confirmadas.</p> : null}
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
