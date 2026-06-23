import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Minhas Compras",
};

type Order = {
  id: string;
  purchase_code: string;
  product_name: string;
  product_type: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
};

export default async function PurchasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: subscription }, { data }] = await Promise.all([
    supabase.from("subscriptions").select("status, plan_name").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, purchase_code, product_name, product_type, amount, payment_method, payment_status, paid_at, created_at")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const orders = (data || []) as Order[];

  return (
    <DashboardShell user={user} subscription={subscription}>
      <section className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a843]">Histórico de compras</p>
        <h1 className="mt-2 text-3xl font-black text-[#061421]">Minhas Compras</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          Consulte seus comprovantes, produtos liberados e status de pagamento em um ambiente seguro.
        </p>
      </section>

      {orders.some((order) => order.payment_status === "Pagamento Confirmado") ? (
        <div className="rounded-[1.25rem] border border-[#00c853]/40 bg-[#00c853]/10 p-4 text-sm font-black text-[#05281f]">
          Compra confirmada com sucesso! Seu acesso já foi liberado.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#05281f] text-white">
              <tr>
                <th className="px-5 py-4">Código</th>
                <th>Produto</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-black text-[#061421]">{order.purchase_code}</td>
                  <td>
                    <p className="font-bold text-[#061421]">{order.product_name}</p>
                    <p className="text-xs font-semibold text-slate-500">{order.payment_method}</p>
                  </td>
                  <td>{formatCurrency(order.amount)}</td>
                  <td>{new Date(order.paid_at || order.created_at).toLocaleString("pt-BR")}</td>
                  <td className="font-black text-[#128C3E]">{order.payment_status}</td>
                  <td>
                    <Link href={`/api/orders/${order.id}/receipt`} className="rounded-md bg-[#061421] px-3 py-2 text-xs font-black text-white">
                      Baixar comprovante
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? <p className="p-5 text-sm text-slate-500">Nenhuma compra confirmada ainda.</p> : null}
      </section>
    </DashboardShell>
  );
}
