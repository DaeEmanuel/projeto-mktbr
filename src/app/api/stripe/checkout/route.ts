import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getOrCreateStripeCustomer({
  userId,
  email,
}: {
  userId: string;
  email?: string | null;
}) {
  const stripe = getStripe();
  const supabaseAdmin = createAdminClient();

  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id as string;
  }

  const customer = await stripe.customers.create({
    email: email || undefined,
    metadata: {
      user_id: userId,
      platform: "MKTBR",
    },
  });

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customer.id,
      status: "pending",
      plan_name: "Academia Pro",
      subscription_status: "pending",
      subscription_plan: "Academia Pro",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return customer.id;
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "STRIPE_PRICE_ID não configurado." }, { status: 500 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mktbr.site";
  const customerId = await getOrCreateStripeCustomer({ userId: user.id, email: user.email });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    client_reference_id: user.id,
    success_url: `${appUrl}/dashboard/minha-assinatura?checkout=success`,
    cancel_url: `${appUrl}/planos?checkout=cancelled`,
    metadata: {
      user_id: user.id,
      product: "mktbr-academia",
      plan_name: "Academia Pro",
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        product: "mktbr-academia",
        plan_name: "Academia Pro",
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
