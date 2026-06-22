import { redirect } from "next/navigation";
import { ButtonEditor } from "@/components/bottons/ButtonEditor";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Gerador Profissional de Bottons | MKTBR",
  description: "Crie bottons profissionais com modelos, QR Code, IA e exportacao para PNG ou folha A4.",
};

export default async function GeradorBottonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/painel/gerador-bottons");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <DashboardShell user={user} subscription={subscription}>
      <div className="grid gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">MKTBR Criadores</p>
          <h1 className="mt-2 text-3xl font-black text-[#061421]">Gerador Profissional de Bottons</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Crie artes para bottons com modelos por nicho, QR Code, IA, mockups, exportacao PNG e folha A4 para impressao.
          </p>
        </div>
        <ButtonEditor />
      </div>
    </DashboardShell>
  );
}