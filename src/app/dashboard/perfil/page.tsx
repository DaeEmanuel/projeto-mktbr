import { redirect } from "next/navigation";
import { DashboardShell, getDisplayName } from "@/components/dashboard-shell";
import { ProfileForm } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Editar Perfil",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <DashboardShell user={user} subscription={subscription}>
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-[#061421]">Editar Perfil</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Atualize seu nome e a foto exibida no topo da area do aluno.
        </p>
        <div className="mt-5 max-w-xl">
          <ProfileForm
            initialName={getDisplayName(user)}
            initialAvatarUrl={user.user_metadata?.avatar_url || ""}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
