import { CheckCircle2, Megaphone, MessageCircle, Sparkles, Users } from "lucide-react";
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
                acompanhe o progresso dos seus alunos em um único lugar.
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

        <section className="bg-[#f4f8f3] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#05281f] text-white shadow-2xl shadow-[#05281f]/20">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
              <div className="flex flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#83f5aa]/25 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#83f5aa]">
                  <MessageCircle size={16} />
                  Canal oficial
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">🚀 Entre no canal oficial do MKTBR.site</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/76">
                  Receba oportunidades, novidades, cursos, e-books, ferramentas de IA e estratégias de marketing digital diretamente no seu WhatsApp.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/64">
                  Fique por dentro das atualizações do MKTBR.site, acompanhe novos conteúdos, ofertas especiais e recursos para crescer no digital.
                </p>
                <p className="mt-5 text-lg font-black text-[#83f5aa]">Aprenda, venda e cresça com o MKTBR.site.</p>
                <a
                  href="https://whatsapp.com/channel/0029Vb8NF7j6xCSPxNOgc92e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#00c853] px-6 py-3 text-sm font-black text-[#05281f] shadow-lg shadow-[#00c853]/20 transition hover:-translate-y-0.5 hover:bg-[#83f5aa]"
                >
                  <MessageCircle size={18} />
                  Entrar no Canal do WhatsApp
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { title: "IA aplicada", text: "Ideias práticas para acelerar criação, automação e vendas.", icon: Sparkles },
                  { title: "Marketing digital", text: "Estratégias e ofertas para empreendedores digitais.", icon: Megaphone },
                  { title: "Comunidade", text: "Novidades para alunos, autores, criadores e vendedores.", icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                      <Icon className="text-[#83f5aa]" size={24} />
                      <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/66">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <Section
          eyebrow="Plataforma"
          title="Tudo que uma plataforma de cursos precisa para começar"
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
