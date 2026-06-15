import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalButton } from "@/components/portal-button";
import { courseModules, dashboardItems, publicCourses } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
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
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
              Área do aluno
            </p>
            <h1 className="text-2xl font-black text-[#061421]">Dashboard MKTBR Academia</h1>
          </div>
          <Link href="/" className="rounded-md bg-[#061421] px-4 py-2 text-sm font-bold text-white">
            Site
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">{user.email}</p>
          <div className="mt-5 rounded-md bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Assinatura</p>
            <p className="mt-1 text-lg font-black text-[#061421]">
              {subscription?.status || "pendente"}
            </p>
            <p className="text-sm text-slate-500">{subscription?.plan_name || "Academia Pro"}</p>
          </div>
          <div className="mt-4">
            <PortalButton />
          </div>
          <nav className="mt-5 grid gap-2">
            <Link
              href="/dashboard/escritor"
              className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-[#061421] hover:bg-slate-100"
            >
              Painel do escritor
            </Link>
            <Link
              href="/dashboard/admin"
              className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-[#061421] hover:bg-slate-100"
            >
              Painel do administrador
            </Link>
            <Link
              href="/livros"
              className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-[#061421] hover:bg-slate-100"
            >
              Marketplace de livros
            </Link>
            <Link
              href="/social-ia/dashboard"
              className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-[#061421] hover:bg-slate-100"
            >
              MKTBR Social IA
            </Link>
          </nav>
        </aside>

        <section className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5">
                  <Icon size={22} className="text-[#00c853]" />
                  <p className="mt-4 text-3xl font-black text-[#061421]">{item.value}</p>
                  <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-[#061421]">Meus cursos</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {publicCourses.map((course) => (
                <article key={course.slug} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase text-[#00c853]">{course.level}</p>
                  <h3 className="mt-2 font-black">{course.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                  <Link
                    href={`/cursos/${course.slug}`}
                    className="mt-4 inline-flex text-sm font-black text-[#128C3E]"
                  >
                    Continuar
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black text-[#061421]">Próximas aulas</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {courseModules.map((module) => (
                <div key={module.title} className="rounded-md bg-slate-50 p-4">
                  <p className="font-black">{module.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{module.lessons.length} aulas</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
