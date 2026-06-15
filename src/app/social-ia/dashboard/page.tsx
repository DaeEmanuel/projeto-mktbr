import Link from "next/link";
import { redirect } from "next/navigation";
import { SocialFeatureGrid } from "@/components/social-feature-grid";
import { dashboardUsage, socialPlatforms } from "@/lib/social-ia";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Social IA",
};

export default async function SocialIaDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
              MKTBR Social IA
            </p>
            <h1 className="text-2xl font-black text-[#061421]">Dashboard Social IA</h1>
          </div>
          <Link href="/social-ia" className="rounded-md bg-[#061421] px-4 py-2 text-sm font-bold text-white">
            Planos
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {dashboardUsage.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5">
                <Icon size={22} className="text-[#00c853]" />
                <p className="mt-4 text-3xl font-black text-[#061421]">
                  {item.used}/{item.limit}
                </p>
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              </div>
            );
          })}
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-[#061421]">Ferramentas</h2>
          <div className="mt-5">
            <SocialFeatureGrid />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-black text-[#061421]">Integracoes futuras</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {socialPlatforms.map((platform) => (
              <div key={platform} className="rounded-md bg-slate-50 p-4 text-sm font-black text-[#061421]">
                {platform}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
