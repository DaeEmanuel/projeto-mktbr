import { NextResponse } from "next/server";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("purchase_code, product_name, amount, buyer_name, buyer_email, payment_method, payment_status, paid_at, created_at")
    .eq("id", id)
    .eq("buyer_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Compra nao encontrada." }, { status: 404 });
  }

  const receipt = [
    "MKTBR - Comprovante Digital",
    "--------------------------------",
    `Codigo da compra: ${order.purchase_code}`,
    `Produto: ${order.product_name}`,
    `Valor: ${formatCurrency(order.amount)}`,
    `Cliente: ${order.buyer_name || order.buyer_email || "Cliente MKTBR"}`,
    `E-mail: ${order.buyer_email || "Nao informado"}`,
    `Metodo de pagamento: ${order.payment_method}`,
    `Status: ${order.payment_status}`,
    `Data: ${new Date(order.paid_at || order.created_at).toLocaleString("pt-BR")}`,
    "--------------------------------",
    "Seu acesso foi liberado automaticamente apos a confirmacao do pagamento.",
  ].join("\n");

  return new Response(receipt, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="comprovante-${order.purchase_code}.txt"`,
    },
  });
}
