import { NextResponse } from "next/server";
import { calculateWriterNet, PLATFORM_COMMISSION_CENTS } from "@/lib/money";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const bookId = String(body.bookId || "");

  if (!bookId) {
    return NextResponse.json({ error: "Livro nao informado." }, { status: 400 });
  }

  const { data: book, error } = await supabase
    .from("books")
    .select("id, title, price_cents, writer_id, published")
    .eq("id", bookId)
    .eq("published", true)
    .single();

  if (error || !book) {
    return NextResponse.json({ error: "Livro indisponivel." }, { status: 404 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mktbr.site";
  const writerNetCents = calculateWriterNet(book.price_cents);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: book.price_cents,
          product_data: {
            name: book.title,
            metadata: {
              book_id: book.id,
              writer_id: book.writer_id,
            },
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?book_checkout=success`,
    cancel_url: `${appUrl}/livros?book_checkout=cancelled`,
    metadata: {
      product: "book",
      book_id: book.id,
      writer_id: book.writer_id,
      buyer_id: user.id,
      sale_amount_cents: String(book.price_cents),
      platform_commission_cents: String(PLATFORM_COMMISSION_CENTS),
      writer_net_cents: String(writerNetCents),
    },
  });

  return NextResponse.json({ url: session.url });
}
