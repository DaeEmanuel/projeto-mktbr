import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const priceCents = Math.round(Number(body.priceReais || 0) * 100);

  if (!title || priceCents < 501) {
    return NextResponse.json(
      { error: "Informe titulo e preco acima de R$ 5,00." },
      { status: 400 },
    );
  }

  const slug = `${slugify(title)}-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("books")
    .insert({
      writer_id: user.id,
      slug,
      title,
      description,
      price_cents: priceCents,
      published: true,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ book: data });
}
