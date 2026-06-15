import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { calculateWriterNet, PLATFORM_COMMISSION_CENTS } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook Stripe nao configurado." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Assinatura invalida." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || session.metadata?.user_id;

    if (session.metadata?.product === "book") {
      const saleAmountCents =
        session.amount_total || Number(session.metadata.sale_amount_cents || 0);
      const writerNetCents = calculateWriterNet(saleAmountCents);
      const bookId = session.metadata.book_id;
      const writerId = session.metadata.writer_id;
      const buyerId = session.metadata.buyer_id || userId;

      if (bookId && writerId && saleAmountCents > 0) {
        const { data: sale } = await supabase
          .from("book_sales")
          .upsert(
            {
              book_id: bookId,
              writer_id: writerId,
              buyer_id: buyerId || null,
              buyer_email: session.customer_details?.email || session.customer_email,
              sale_amount_cents: saleAmountCents,
              platform_commission_cents: PLATFORM_COMMISSION_CENTS,
              writer_net_cents: writerNetCents,
              currency: String(session.currency || "brl").toUpperCase(),
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id,
              status: "paid",
              sold_at: new Date().toISOString(),
            },
            { onConflict: "stripe_checkout_session_id" },
          )
          .select("id")
          .single();

        if (sale) {
          await supabase.from("writer_payouts").insert({
            writer_id: writerId,
            book_sale_id: sale.id,
            amount_cents: writerNetCents,
            status: "pending",
            notes: "Repasse gerado automaticamente apos venda de livro.",
          });
        }
      }
    } else if (userId) {
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        status: "active",
        plan_name: "Academia Pro",
        stripe_customer_id: String(session.customer),
        stripe_subscription_id: String(session.subscription),
        current_period_end: null,
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_end: new Date(subscription.items.data[0]?.current_period_end * 1000),
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
