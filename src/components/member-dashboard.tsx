import Link from "next/link";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, Gem, PlayCircle, Radio, Sparkles, Trophy, Users, Video, Bell, BarChart3, Bot, Mail } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { MemberCourseGrid } from "@/components/member-course-grid";
import { PurchaseRealtimeNotice } from "@/components/purchase-realtime-notice";
import { courseModules, dashboardItems, publicCourses } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const memberTabs = [
  {
    id: "vitrine",
    label: "Vitrine Premium",
    title: "Cursos organizados para vender mais",
    text: "Apresente aulas, produtos digitais e jornadas de aprendizado com uma vitrine clara, elegante e pronta para conversão.",
    icon: Gem,
    benefits: ["Catálogo visual de cursos", "Destaques para lançamentos", "Experiência premium para novos alunos"],
  },
  {
    id: "player",
    label: "Player de vídeo",
    title: "Aulas com foco e retenção",
    text: "Centralize vídeos, módulos e materiais em uma experiência limpa para o aluno continuar de onde parou.",
    icon: PlayCircle,
    benefits: ["Player organizado por módulos", "Acesso privado aos conteúdos", "Ambiente seguro para assistir aulas"],
  },
  {
    id: "webinarios",
    label: "Webinários",
    title: "Eventos ao vivo para engajar e vender",
    text: "Planeje encontros, mentorias e aulas especiais para aproximar sua audiência e acelerar decisões de compra.",
    icon: Radio,
    benefits: ["Agenda de transmissões", "Chamadas para inscrição", "Relacionamento em tempo real"],
  },
  {
    id: "desafios",
    label: "Desafios e gamificação",
    title: "Motivação contínua para alunos ativos",
    text: "Use desafios, metas e conquistas para manter a comunidade engajada durante toda a jornada.",
    icon: Trophy,
    benefits: ["Missões por etapa", "Reconhecimento de progresso", "Mais participação da comunidade"],
  },
  {
    id: "comunidade",
    label: "Feed Comunidade",
    title: "Um espaço vivo para relacionamento",
    text: "Reúna conversas, atualizações e conteúdos de bastidores em uma área privada com sensação de comunidade.",
    icon: Users,
    benefits: ["Publicações para membros", "Interação recorrente", "Pertencimento e retenção"],
  },
  {
    id: "videos",
    label: "Feed de vídeos",
    title: "Conteúdos rápidos para manter presença",
    text: "Distribua vídeos curtos, avisos e pílulas de conteúdo em formato simples de consumir.",
    icon: Video,
    benefits: ["Conteúdo em sequência", "Destaques por campanha", "Mais frequência de contato"],
  },
  {
    id: "notificacoes",
    label: "Notificações",
    title: "Comunicação que não se perde",
    text: "Organize avisos importantes para manter alunos e compradores informados nos momentos certos.",
    icon: Bell,
    benefits: ["Alertas para novidades", "Avisos comerciais", "Comunicação centralizada"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Indicadores claros para decidir melhor",
    text: "Acompanhe o desempenho da sua operação digital sem termos técnicos ou confusão visual.",
    icon: BarChart3,
    benefits: ["Visão de crescimento", "Dados protegidos", "Leitura rápida dos resultados"],
  },
  {
    id: "ia",
    label: "Gerente IA",
    title: "Assistência inteligente para crescer com rotina",
    text: "Use recursos de inteligência para transformar ideias, campanhas e comunicação em ações mais previsíveis.",
    icon: Bot,
    benefits: ["Sugestões de conteúdo", "Apoio para campanhas", "Comunicação mais consistente"],
  },
  {
    id: "email",
    label: "E-mail Marketing",
    title: "Relacionamento recorrente com sua base",
    text: "Planeje mensagens, ofertas e sequências para manter sua audiência próxima da próxima compra.",
    icon: Mail,
    benefits: ["Campanhas para alunos", "Sequências de venda", "Ativação de compradores"],
  },
];

export async function MemberDashboard() {
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let user: User | null = null;
  let authFailed = false;

  try {
    supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    user = userResult.data.user;
    authFailed = Boolean(userResult.error);
  } catch {
    authFailed = true;
  }

  if (!user) {
    if (authFailed) {
      return <DashboardSessionFallback />;
    }

    redirect("/login?redirect=/meu-painel");
  }

  if (!supabase) {
    return <DashboardSessionFallback />;
  }

  let subscription: { status?: string | null; plan_name?: string | null; subscription_status?: string | null; subscription_plan?: string | null } | null = null;
  let ordersData: { id: string; product_name: string; amount: number; payment_status: string; paid_at: string | null; created_at: string }[] = [];
  let dashboardWarning = "";

  try {
    const [subscriptionResult, ordersResult] = await Promise.allSettled([
      supabase
        .from("subscriptions")
        .select("status, plan_name, subscription_status, subscription_plan")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("id, product_name, amount, payment_status, paid_at, created_at")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (subscriptionResult.status === "fulfilled" && !subscriptionResult.value.error) {
      subscription = subscriptionResult.value.data;
    }

    if (ordersResult.status === "fulfilled" && !ordersResult.value.error) {
      ordersData = ordersResult.value.data || [];
    }
  } catch {
    dashboardWarning = "";
  }

  const confirmedOrders = ordersData.filter((order) => order.payment_status === "Pagamento Confirmado");
  const latestConfirmedOrder = confirmedOrders[0];

  return (
    <DashboardShell user={user} subscription={subscription}>
      <PurchaseRealtimeNotice userId={user.id} />
      {dashboardWarning ? (
        <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          {dashboardWarning}
        </div>
      ) : null}
      {latestConfirmedOrder ? (
        <div className="rounded-[1.25rem] border border-[#00c853]/40 bg-[#00c853]/10 p-4 text-sm font-black text-[#05281f] shadow-sm">
          Compra confirmada com sucesso! Seu acesso a {latestConfirmedOrder.product_name} já foi liberado.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.75rem] bg-[#05281f] text-white shadow-2xl">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#83f5aa]">Área de membros premium</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Da experiência do aluno ao crescimento previsível.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Estruture conteúdo, comunidade e comunicação em um único ecossistema que transforma engajamento em vendas recorrentes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/dashboard/meus-cursos" className="rounded-full bg-[#00c853] px-5 py-3 text-sm font-black text-[#05281f]">
                Continuar aprendendo
              </Link>
              <Link href="/planos" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
                Ver assinatura
              </Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 shadow-inner">
            <div className="rounded-[1.2rem] bg-[#f4f8f3] p-4 text-[#061421]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase text-[#00a843]">Compras</p>
                  <p className="mt-4 text-2xl font-black">{confirmedOrders.length}</p>
                  <p className="text-sm font-bold text-slate-500">Acessos liberados</p>
                </div>
                {dashboardItems.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
                      <Icon size={22} className="text-[#00a843]" />
                      <p className="mt-4 text-2xl font-black">{item.value}</p>
                      <p className="text-sm font-bold text-slate-500">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="dashboard-tabs grid gap-5">
          <style>{`
            .dashboard-tabs .tab-panel { display: none; }
            .dashboard-tabs:has(#tab-vitrine:checked) [data-tab-panel="vitrine"],
            .dashboard-tabs:has(#tab-player:checked) [data-tab-panel="player"],
            .dashboard-tabs:has(#tab-webinarios:checked) [data-tab-panel="webinarios"],
            .dashboard-tabs:has(#tab-desafios:checked) [data-tab-panel="desafios"],
            .dashboard-tabs:has(#tab-comunidade:checked) [data-tab-panel="comunidade"],
            .dashboard-tabs:has(#tab-videos:checked) [data-tab-panel="videos"],
            .dashboard-tabs:has(#tab-notificacoes:checked) [data-tab-panel="notificacoes"],
            .dashboard-tabs:has(#tab-dashboard:checked) [data-tab-panel="dashboard"],
            .dashboard-tabs:has(#tab-ia:checked) [data-tab-panel="ia"],
            .dashboard-tabs:has(#tab-email:checked) [data-tab-panel="email"] { display: grid; }
            .dashboard-tabs label:has(input:checked) { border-color: #00c853; color: #05281f; background: #eaffef; box-shadow: inset 0 -2px 0 #00c853; }
          `}</style>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {memberTabs.map((tab, index) => (
              <label key={tab.id} htmlFor={`tab-${tab.id}`} className="shrink-0 cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-600 transition hover:border-[#00c853] hover:text-[#05281f]">
                {tab.label}
                <input id={`tab-${tab.id}`} name="member-tab" type="radio" defaultChecked={index === 0} className="peer sr-only" />
              </label>
            ))}
          </div>

          <div className="grid gap-4">
            {memberTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <article key={tab.id} data-tab-panel={tab.id} className="tab-panel gap-6 rounded-[1.25rem] border border-slate-200 bg-[#f8fbf7] p-5 md:grid-cols-[1fr_320px]">
                  <div>
                    <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#05281f] text-[#83f5aa]">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-5 text-2xl font-black text-[#061421]">{tab.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{tab.text}</p>
                    <div className="mt-5 grid gap-3">
                      {tab.benefits.map((benefit) => (
                        <p key={benefit} className="flex items-center gap-2 text-sm font-bold text-[#061421]">
                          <CheckCircle2 size={17} className="text-[#00a843]" />
                          {benefit}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="grid min-h-56 place-items-center rounded-[1.25rem] bg-[#05281f] p-5 text-center text-white">
                    <Sparkles size={34} className="text-[#83f5aa]" />
                    <p className="mt-4 text-lg font-black">Mockup MKTBR</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">Espaço visual para imagem, player ou demonstração da aba.</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a843]">Conteúdo</p>
              <h2 className="mt-1 text-2xl font-black text-[#061421]">Meus cursos</h2>
            </div>
            <Link href="/dashboard/meus-cursos" className="text-sm font-black text-[#128C3E]">Ver todos</Link>
          </div>
          <MemberCourseGrid
            courses={publicCourses.map((course) => {
              const hasAccess = subscription?.subscription_status === "active" || subscription?.status === "active";
              return {
                ...course,
                hasAccess,
                status: hasAccess ? "Acesso liberado" : "Nao adquirido",
              };
            })}
          />
        </div>

        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a843]">Próximas aulas</p>
          <h2 className="mt-1 text-2xl font-black text-[#061421]">Roteiro de progresso</h2>
          <div className="mt-5 grid gap-3">
            {courseModules.map((module) => (
              <div key={module.title} className="rounded-2xl bg-[#f4f8f3] p-4">
                <p className="font-black text-[#061421]">{module.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{module.lessons.length} aulas disponíveis</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function DashboardSessionFallback() {
  return (
    <main className="min-h-screen bg-[#f4f8f3] px-4 py-16 text-[#061421]">
      <section className="mx-auto max-w-2xl rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a843]">MEU PAINEL</p>
        <h1 className="mt-4 text-3xl font-black">Sua sessao precisa ser renovada</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Seus dados continuam protegidos. Entre novamente para atualizar o acesso ao painel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login?redirect=/meu-painel" className="rounded-lg bg-[#00c853] px-5 py-3 text-sm font-black text-[#061421]">
            Entrar novamente
          </Link>
          <Link href="/" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-black">
            Voltar para Home
          </Link>
        </div>
      </section>
    </main>
  );
}
