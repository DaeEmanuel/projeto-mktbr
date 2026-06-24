import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { publicCourses } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Meus Cursos",
};

export default async function MeusCursosPage() {
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
        <h2 className="text-xl font-black text-[#061421]">Meus Cursos</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Continue seus estudos e acompanhe os cursos disponiveis na MKTBR Site.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {publicCourses.map((course) => (
            <article key={course.slug} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-black uppercase text-[#00c853]">{course.level}</p>
              <h3 className="mt-2 font-black">{course.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-0 rounded-full bg-[#00c853]" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500">0% concluido</p>
              <Link
                href={`/cursos/${course.slug}`}
                className="mt-4 inline-flex text-sm font-black text-[#128C3E]"
              >
                Acessar curso
              </Link>
            </article>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
