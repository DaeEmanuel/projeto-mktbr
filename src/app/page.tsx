import { CheckCircle2 } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { features, publicCourses, site, stats } from "@/lib/site";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#061421] text-white">
          <div className="mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
                {site.slogan}
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                MKTBR Academia — Cursos online para negócios que querem vender mais
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
                Venda cursos online, receba pagamentos por Pix, boleto e cartão e
                acompanhe o progresso dos seus alunos em um unico lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/cadastro">Começar agora</ButtonLink>
                <ButtonLink href="/cursos" variant="secondary">
                  Ver cursos
                </ButtonLink>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 text-center sm:max-w-lg">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white p-4 text-[#061421] shadow-2xl shadow-black/30">
              <div className="rounded-md bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-black">Trilha do aluno</p>
                  <span className="rounded-full bg-[#00c853]/15 px-3 py-1 text-xs font-black text-[#128C3E]">
                    assinatura
                  </span>
                </div>
                <div className="mt-5 grid gap-3">
                  {publicCourses.map((course) => (
                    <div key={course.slug} className="rounded-md border border-slate-200 bg-white p-4">
                      <p className="text-sm font-black">{course.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {course.lessons} aulas • {course.level}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section
          eyebrow="Plataforma"
          title="Tudo que uma plataformade cursos precisa para começar"
          text="Autenticação, catálogo, assinatura recorrente, dashboard do aluno e banco Supabase independente."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-lg border border-slate-200 p-5">
                  <Icon className="text-[#00c853]" size={28} />
                  <h3 className="mt-4 text-lg font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </Section>

        <Section
          eyebrow="Modelo"
          title="Assinatura mensal com Stripe"
          text="O checkout foi preparado para cobrar recorrência, atualizar o banco via webhook e liberar acesso para alunos ativos."
          dark
        >
          <div className="grid gap-3 md:grid-cols-3">
            {["Checkout seguro", "Webhook verificado", "Portal do cliente"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <CheckCircle2 className="text-[#00c853]" />
                <p className="mt-3 font-black">{item}</p>
              </div>
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
