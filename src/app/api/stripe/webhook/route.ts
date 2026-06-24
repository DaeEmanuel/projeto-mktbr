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

function toDate(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function getSubscriptionEndDate(subscription: Stripe.Subscription) {
  const source = subscription as Stripe.Subscription & { current_period_end?: number | null };
  return toDate(source.current_period_end || subscription.items.data[0]?.current_period_end || null);
}

function getSubscriptionStartDate(subscription: Stripe.Subscription) {
  const source = subscription as Stripe.Subscription & { start_date?: number | null };
  return toDate(source.start_date || subscription.created || null);
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.id || null;
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
  title = "Nova compra confirmada",
  type = "admin_sale",
}: {
  supabase: ReturnType<typeof createAdminClient>;
  body: string;
  orderId?: string | null;
  title?: string;
  type?: string;
}) {
  await supabase.from("admin_notifications").insert({
    title,
    message: body,
    notification_type: type,
    order_id: orderId || null,
    severity: "success",
  });

  const { data: admins } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")
    .eq("blocked", false);

  await Promise.all(
    (admins || []).map((admin) =>
      createNotification({
        supabase,
        userId: admin.id,
        title,
        body,
        type,
        orderId,
      }),
    ),
  );
}
async function findUserIdForCustomer({
  supabase,
  customerId,
}: {
  supabase: ReturnType<typeof createAdminClient>;
  customerId?: string | null;
}) {
  if (!customerId) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.user_id || null;
}

async function syncSubscription({
  supabase,
  subscription,
  userId,
  statusOverride,
  invoiceId,
  paymentIntentId,
}: {
  supabase: ReturnType<typeof createAdminClient>;
  subscription: Stripe.Subscription;
  userId?: string | null;
  statusOverride?: string;
  invoiceId?: string | null;
  paymentIntentId?: string | null;
}) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const resolvedUserId = userId || subscription.metadata?.user_id || (await findUserIdForCustomer({ supabase, customerId }));
  const status = statusOverride || subscription.status;
  const planName = subscription.metadata?.plan_name || "Academia Pro";
  const startDate = getSubscriptionStartDate(subscription);
  const endDate = getSubscriptionEndDate(subscription);

  if (!resolvedUserId) return null;

  const payload = {
    user_id: resolvedUserId,
    status,
    plan_name: planName,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id,
    current_period_end: endDate,
    subscription_status: status,
    subscription_plan: planName,
    subscription_start_date: startDate,
    subscription_end_date: endDate,
    stripe_price_id: getSubscriptionPriceId(subscription),
    stripe_latest_invoice_id: invoiceId || null,
    stripe_latest_payment_intent_id: paymentIntentId || null,
    updated_at: new Date().toISOString(),
  };

  await supabase.from("subscriptions").upsert(payload, { onConflict: "user_id" });
  return { userId: resolvedUserId, customerId, endDate, status };
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
  stripe,
  supabase,
}: {
  session: Stripe.Checkout.Session;
  stripe: Stripe;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const userId = session.client_reference_id || session.metadata?.user_id;
  if (!userId) return;

  const paidAt = new Date().toISOString();
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  let synced: Awaited<ReturnType<typeof syncSubscription>> = null;

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    synced = await syncSubscription({
      supabase,
      subscription,
      userId,
      statusOverride: "active",
    });
  } else {
    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        status: "active",
        plan_name: "Academia Pro",
        stripe_customer_id: String(session.customer || ""),
        stripe_subscription_id: "",
        current_period_end: null,
        subscription_status: "active",
        subscription_plan: "Academia Pro",
        subscription_start_date: paidAt,
        subscription_end_date: null,
        updated_at: paidAt,
      },
      { onConflict: "user_id" },
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .upsert(
      {
        buyer_id: userId,
        product_id: String(session.metadata?.product || "mktbr-academia"),
        product_type: "assinatura",
        product_name: "MKTBR Site Pro",
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

  const subscriptionBody = synced?.endDate
    ? `Seu plano MKTBR Site Pro está ativo. Próxima renovação: ${new Date(synced.endDate).toLocaleDateString("pt-BR")}.`
    : "Seu plano MKTBR Site Pro está ativo e seu acesso premium já foi liberado.";

  await Promise.all([
    createNotification({
      supabase,
      userId,
      title: "Assinatura renovada",
      body: subscriptionBody,
      type: "subscription",
      orderId: order?.id || null,
    }),
    notifyAdmins({
      supabase,
      title: "Assinatura confirmada",
      type: "admin_subscription",
      body: `Cliente: ${session.customer_details?.email || session.customer_email || userId}. Plano: MKTBR Site Pro. Valor: ${formatCurrency(session.amount_total || 0)}. Status: Pagamento Confirmado.`,
      orderId: order?.id || null,
    }),
  ]);
}

async function handleInvoicePaid({
  invoice,
  stripe,
  supabase,
}: {
  invoice: Stripe.Invoice;
  stripe: Stripe;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const invoiceData = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    payment_intent?: string | Stripe.PaymentIntent | null;
  };
  const subscriptionId = typeof invoiceData.subscription === "string" ? invoiceData.subscription : invoiceData.subscription?.id;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const synced = await syncSubscription({
    supabase,
    subscription,
    statusOverride: "active",
    invoiceId: invoice.id,
    paymentIntentId: typeof invoiceData.payment_intent === "string" ? invoiceData.payment_intent : invoiceData.payment_intent?.id || null,
  });

  const userId = synced?.userId || (await findUserIdForCustomer({ supabase, customerId }));
  await createNotification({
    supabase,
    userId,
    title: "Assinatura renovada",
    body: synced?.endDate
      ? `Pagamento confirmado. Próxima renovação: ${new Date(synced.endDate).toLocaleDateString("pt-BR")}.`
      : "Pagamento confirmado. Seu acesso premium está liberado.",
    type: "subscription",
  });
}

async function handleInvoicePaymentFailed({
  invoice,
  supabase,
}: {
  invoice: Stripe.Invoice;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const invoiceData = invoice as Stripe.Invoice & { subscription?: string | null };
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const userId = await findUserIdForCustomer({ supabase, customerId });
  const now = new Date().toISOString();

  if (invoiceData.subscription) {
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        subscription_status: "past_due",
        stripe_latest_invoice_id: invoice.id,
        updated_at: now,
      })
      .eq("stripe_subscription_id", invoiceData.subscription);
  } else if (customerId) {
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        subscription_status: "past_due",
        stripe_latest_invoice_id: invoice.id,
        updated_at: now,
      })
      .eq("stripe_customer_id", customerId);
  }

  await createNotification({
    supabase,
    userId,
    title: "Pagamento não aprovado",
    body: "Não foi possível confirmar a renovação da sua assinatura. Atualize o pagamento para manter o acesso premium.",
    type: "subscription_payment_failed",
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
      await confirmSubscriptionPurchase({ session, stripe, supabase });
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

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscription({ supabase, subscription });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscription({ supabase, subscription, statusOverride: "canceled" });
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    await handleInvoicePaid({ invoice, stripe, supabase });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    await handleInvoicePaymentFailed({ invoice, supabase });
  }

  return NextResponse.json({ received: true });
}
