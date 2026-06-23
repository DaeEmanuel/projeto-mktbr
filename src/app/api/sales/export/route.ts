import { NextResponse } from "next/server";
import { formatCurrency } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

type Order = {
  purchase_code: string;
  product_name: string;
  buyer_name: string | null;
  buyer_email: string | null;
  amount: number;
  payment_method: string;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
};

const validFormats = new Set(["csv", "excel", "pdf"]);

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

function sanitizeCell(value: string | number | null) {
  return String(value ?? "").replace(/"/g, '""');
}

function toCsv(orders: Order[], separator = ";") {
  const header = ["Codigo", "Produto", "Cliente", "Email", "Valor", "Metodo", "Data", "Status"];
  const rows = orders.map((order) => [
    order.purchase_code,
    order.product_name,
    order.buyer_name || "Cliente MKTBR",
    order.buyer_email || "",
    formatCurrency(order.amount),
    order.payment_method,
    new Date(order.paid_at || order.created_at).toLocaleString("pt-BR"),
    order.payment_status,
  ]);

  return [header, ...rows].map((row) => row.map((cell) => `"${sanitizeCell(cell)}"`).join(separator)).join("\n");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  const safeLines = lines.slice(0, 36).map(escapePdfText);
  const content = ["BT", "/F1 12 Tf", "50 790 Td", "14 TL", ...safeLines.map((line, index) => `${index === 0 ? "" : "T* "}(${line}) Tj`), "ET"].join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream\nendobj\n`,
  ];

  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  const body = objects.map((object) => {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
    offset += Buffer.byteLength(object);
    return object;
  }).join("");
  const xrefStart = Buffer.byteLength(`%PDF-1.4\n${body}`);
  const trailer = `xref\n0 ${objects.length + 1}\n${xref.join("\n")}\ntrailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(`%PDF-1.4\n${body}${trailer}`, "utf-8");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = validFormats.has(url.searchParams.get("format") || "") ? url.searchParams.get("format") || "csv" : "csv";
  const range = url.searchParams.get("range") || "30d";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data } = await supabase
    .from("orders")
    .select("purchase_code, product_name, buyer_name, buyer_email, amount, payment_method, payment_status, paid_at, created_at")
    .eq("author_id", user.id)
    .gte("created_at", getRangeStart(range).toISOString())
    .order("created_at", { ascending: false });

  const orders = (data || []) as Order[];
  const filenameDate = new Date().toISOString().slice(0, 10);

  if (format === "pdf") {
    const total = orders.reduce((sum, order) => sum + (order.payment_status === "Pagamento Confirmado" ? order.amount : 0), 0);
    const lines = [
      "MKTBR - Relatorio de Vendas",
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      `Total de vendas: ${orders.length}`,
      `Receita confirmada: ${formatCurrency(total)}`,
      "",
      ...orders.map((order) => `${order.purchase_code} - ${order.product_name} - ${formatCurrency(order.amount)} - ${order.payment_status}`),
    ];
    return new Response(buildSimplePdf(lines), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="vendas-mktbr-${filenameDate}.pdf"`,
      },
    });
  }

  const content = toCsv(orders, format === "excel" ? "\t" : ";");
  return new Response(content, {
    headers: {
      "content-type": format === "excel" ? "application/vnd.ms-excel; charset=utf-8" : "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="vendas-mktbr-${filenameDate}.${format === "excel" ? "xls" : "csv"}"`,
    },
  });
}
