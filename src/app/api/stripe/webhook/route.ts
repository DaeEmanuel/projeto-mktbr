import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { calculateWriterNet, formatCurrency, PLATFORM_COMMISSION_CENTS } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

function getPaymentMethod(session: Stripe.Checkout.Session) {
  const method = session.payment_method_types?.[0] || "stripe";
  if (method === "card") return "Cartao / Stripe";
  if (method === "boleto") return "Boleto";
  if (method === "pix") return "Pix";
  return "Stripe";
}

async function createNotification({
  supabase,
  userId,
  title,
  body,
  type,
  orderId,
}: {
  supabase: ReturnType<typeof createAdminClient>;
  userId?: string | null;
  title: string;
  body?: string;
  type: string;
  orderId?: string | null;
}) {
  if (!userId) return;

  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body: body || null,
    notification_type: type,
    related_order_id: orderId || null,
  });
}

async function notifyAdmins({
  supabase,
  body,
  orderId,
}: {
  supabase: ReturnType<typeof createAdminClient>;
  body: string;
  orderId?: string | null;
}) {
  const { data: admins } = await supabase.from("users").select("id").eq("role", "admin");
  await Promise.all(
    (admins || []).map((admin) =>
      createNotification({
        supabase,
        userId: admin.id,
        title: "Nova compra confirmada",
        body,
        type: "admin_sale",
        orderId,
      }),
    ),
  );
}

async function confirmBookPurchase({
  session,
  supabase,
}: {
  session: Stripe.Checkout.Session;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const saleAmountCents = session.amount_total || Number(session.metadata?.sale_amount_cents || 0);
  const writerNetCents = calculateWriterNet(saleAmountCents);
  const bookId = session.metadata?.book_id;
  const writerId = session.metadata?.writer_id;
  const buyerId = session.metadata?.buyer_id || session.client_reference_id;

  if (!bookId || !writerId || !buyerId || saleAmountCents <= 0) return;

  const { data: book } = await supabase
    .from("books")
    .select("id, title, allow_download")
    .eq("id", bookId)
    .single();

  const buyerEmail = session.customer_details?.email || session.customer_email || null;
  const buyerName = session.customer_details?.name || buyerEmail || "Cliente MKTBR";
  const productName = book?.title || session.metadata?.product_name || "Ebook MKTBR";
  const paidAt = new Date().toISOString();

  const { data: order } = await supabase
    .from("orders")
    .upsert(
      {
        buyer_id: buyerId,
        product_id: bookId,
        product_type: "ebook",
        product_name: productName,
        author_id: writerId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        amount: saleAmountCents,
        payment_method: getPaymentMethod(session),
        payment_status: "Pagamento Confirmado",
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        paid_at: paidAt,
        updated_at: paidAt,
      },
      { onConflict: "stripe_session_id" },
    )
    .select("id, purchase_code")
    .single();

  const { data: sale } = await supabase
    .from("book_sales")
    .upsert(
      {
        order_id: order?.id || null,
        book_id: bookId,
        writer_id: writerId,
        buyer_id: buyerId,
        buyer_email: buyerEmail,
        sale_amount_cents: saleAmountCents,
        platform_commission_cents: PLATFORM_COMMISSION_CENTS,
        writer_net_cents: writerNetCents,
        currency: String(session.currency || "brl").toUpperCase(),
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        payment_method: getPaymentMethod(session),
        status: "Pagamento Confirmado",
        sold_at: paidAt,
      },
      { onConflict: "stripe_checkout_session_id" },
    )
    .select("id")
    .single();

  await supabase.from("ebook_orders").upsert(
    {
      order_id: order?.id || null,
      ebook_id: bookId,
      buyer_id: buyerId,
      author_id: writerId,
      amount_cents: saleAmountCents,
      platform_fee_cents: PLATFORM_COMMISSION_CENTS,
      author_amount_cents: writerNetCents,
      payment_method: getPaymentMethod(session),
      payment_status: "Pagamento Confirmado",
      stripe_checkout_session_id: session.id,
      paid_at: paidAt,
    },
    { onConflict: "stripe_checkout_session_id" },
  );

  await supabase.from("ebook_purchases").upsert(
    {
      ebook_id: bookId,
      buyer_id: buyerId,
      order_id: order?.id || null,
      allow_download: Boolean(book?.allow_download),
      created_at: paidAt,
    },
    { onConflict: "ebook_id,buyer_id" },
  );

  if (sale) {
    await supabase.from("writer_payouts").upsert(
      {
        order_id: order?.id || null,
        writer_id: writerId,
        book_sale_id: sale.id,
        amount_cents: writerNetCents,
        status: "pending",
        notes: `Repasse gerado automaticamente. Compra ${order?.purchase_code || session.id}.`,
      },
      { onConflict: "book_sale_id" },
    );
  }

  if (order?.id) {
    await supabase.from("writer_earnings").upsert(
      {
        writer_id: writerId,
        ebook_id: bookId,
        order_id: order.id,
        gross_cents: saleAmountCents,
        platform_fee_cents: PLATFORM_COMMISSION_CENTS,
        net_cents: writerNetCents,
        status: "pending",
      },
      { onConflict: "order_id" },
    );

    const notificationBody = `Produto: ${productName}. Cliente: ${buyerName}. Valor: ${formatCurrency(saleAmountCents)}.`;
    await Promise.all([
      createNotification({
        supabase,
        userId: writerId,
        title: "Nova venda realizada",
        body: notificationBody,
        type: "sale",
        orderId: order.id,
      }),
      createNotification({
        supabase,
        userId: buyerId,
        title: "Compra aprovada",
        body: `Seu acesso ao produto ${productName} já foi liberado.`,
        type: "purchase",
        orderId: order.id,
      }),
      notifyAdmins({ supabase, body: notificationBody, orderId: order.id }),
    ]);
  }
}

async function confirmSubscriptionPurchase({
  session,
  supabase,
}: {
  session: Stripe.Checkout.Session;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const userId = session.client_reference_id || session.metadata?.user_id;
  if (!userId) return;

  const paidAt = new Date().toISOString();
  await supabase.from("subscriptions").upsert({
    user_id: userId,
    status: "active",
    plan_name: "Academia Pro",
    stripe_customer_id: String(session.customer || ""),
    stripe_subscription_id: String(session.subscription || ""),
    current_period_end: null,
  });

  const { data: order } = await supabase
    .from("orders")
    .upsert(
      {
        buyer_id: userId,
        product_id: String(session.metadata?.product || "mktbr-academia"),
        product_type: "assinatura",
        product_name: "MKTBR Academia Pro",
        buyer_name: session.customer_details?.name || session.customer_email || "Cliente MKTBR",
        buyer_email: session.customer_details?.email || session.customer_email || null,
        amount: session.amount_total || 0,
        payment_method: getPaymentMethod(session),
        payment_status: "Pagamento Confirmado",
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
        paid_at: paidAt,
        updated_at: paidAt,
      },
      { onConflict: "stripe_session_id" },
    )
    .select("id")
    .single();

  await createNotification({
    supabase,
    userId,
    title: "Assinatura renovada",
    body: "Seu plano MKTBR Academia Pro está ativo e seu acesso premium já foi liberado.",
    type: "subscription",
    orderId: order?.id || null,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook Stripe nao configurado." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Assinatura invalida." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, status: "pending" });
    }

    if (session.metadata?.product === "book") {
      await confirmBookPurchase({ session, supabase });
    } else {
      await confirmSubscriptionPurchase({ session, supabase });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { data: orders } = await supabase
      .from("orders")
      .update({ payment_status: "Pagamento Confirmado", updated_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select("id, buyer_id, product_name");

    await Promise.all(
      (orders || []).map((order) =>
        createNotification({
          supabase,
          userId: order.buyer_id,
          title: "Compra aprovada",
          body: `Seu acesso ao produto ${order.product_name} já foi liberado.`,
          type: "purchase",
          orderId: order.id,
        }),
      ),
    );
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
