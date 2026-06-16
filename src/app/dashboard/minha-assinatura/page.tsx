import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { PortalButton } from "@/components/portal-button";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Minha Assinatura",
};

export default async function MinhaAssinaturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_name, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <DashboardShell user={user} subscription={subscription}>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-[#061421]">Minha Assinatura</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Plano</p>
            <p className="mt-1 text-lg font-black text-[#061421]">
              {subscription?.plan_name || "Academia Pro"}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Status</p>
            <p className="mt-1 text-lg font-black text-[#061421]">
              {subscription?.status || "pendente"}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Renovacao</p>
            <p className="mt-1 text-lg font-black text-[#061421]">
              {subscription?.current_period_end || "Aguardando assinatura"}
            </p>
          </div>
        </div>
        <div className="mt-5 max-w-sm">
          <PortalButton />
        </div>
      </div>
    </DashboardShell>
  );
}
