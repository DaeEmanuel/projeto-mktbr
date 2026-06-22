import { redirect } from "next/navigation";
import { BarChart3, Download, FolderKanban, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Bottons | MKTBR",
};

export default async function AdminBottonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/bottons");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ count: totalProjects }, { data: projectRows }, { data: usersRows }, { data: downloadRows }] = await Promise.all([
    supabase.from("button_projects").select("id", { count: "exact", head: true }),
    supabase.from("button_projects").select("download_count,created_at,nome_projeto").order("created_at", { ascending: false }).limit(8),
    supabase.from("button_projects").select("user_id"),
    supabase.from("button_projects").select("download_count"),
  ]);

  const totalDownloads = (downloadRows || []).reduce((sum, project) => sum + (project.download_count || 0), 0);
  const totalUsers = new Set((usersRows || []).map((row) => row.user_id)).size;
  const stats = [
    { label: "Total de projetos criados", value: String(totalProjects || 0), icon: FolderKanban },
    { label: "Total de downloads", value: String(totalDownloads), icon: Download },
    { label: "Usuários que utilizaram", value: String(totalUsers), icon: Users },
    { label: "Estatísticas", value: "Ativas", icon: BarChart3 },
  ];

  return (
    <DashboardShell user={user} subscription={{ status: "admin", plan_name: "Admin" }}>
      <div className="grid gap-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">Administração</p>
          <h1 className="mt-2 text-3xl font-black text-[#061421]">Gerador de Bottons</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Acompanhe uso, projetos, downloads e estatísticas do módulo.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="text-[#128C3E]" size={24} />
                <p className="mt-4 text-3xl font-black text-[#061421]">{item.value}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{item.label}</p>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#061421]">Projetos recentes</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Projeto</th><th>Downloads</th><th>Criado em</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(projectRows || []).map((project) => (
                  <tr key={`${project.nome_projeto}-${project.created_at}`}><td className="py-3 font-bold text-[#061421]">{project.nome_projeto}</td><td>{project.download_count || 0}</td><td>{new Date(project.created_at).toLocaleDateString("pt-BR")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}