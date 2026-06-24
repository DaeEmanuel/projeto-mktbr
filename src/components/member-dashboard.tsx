import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Gem, PlayCircle, Radio, Sparkles, Trophy, Users, Video, Bell, BarChart3, Bot, Mail } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PurchaseRealtimeNotice } from "@/components/purchase-realtime-notice";
import { courseModules, dashboardItems, publicCourses } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const memberTabs = [
  {
    id: "vitrine",
    label: "Vitrine Premium",
    title: "Cursos organizados para vender mais",
    text: "Apresente aulas, produtos digitais e jornadas de aprendizado com uma vitrine clara, elegante e pronta para conversÃ£o.",
    icon: Gem,
    benefits: ["CatÃ¡logo visual de cursos", "Destaques para lanÃ§amentos", "ExperiÃªncia premium para novos alunos"],
  },
  {
    id: "player",
    label: "Player de vÃ­deo",
    title: "Aulas com foco e retenÃ§Ã£o",
    text: "Centralize vÃ­deos, mÃ³dulos e materiais em uma experiÃªncia limpa para o aluno continuar de onde parou.",
    icon: PlayCircle,
    benefits: ["Player organizado por mÃ³dulos", "Acesso privado aos conteÃºdos", "Ambiente seguro para assistir aulas"],
  },
  {
    id: "webinarios",
    label: "WebinÃ¡rios",
    title: "Eventos ao vivo para engajar e vender",
    text: "Planeje encontros, mentorias e aulas especiais para aproximar sua audiÃªncia e acelerar decisÃµes de compra.",
    icon: Radio,
    benefits: ["Agenda de transmissÃµes", "Chamadas para inscriÃ§Ã£o", "Relacionamento em tempo real"],
  },
  {
    id: "desafios",
    label: "Desafios e gamificaÃ§Ã£o",
    title: "MotivaÃ§Ã£o contÃ­nua para alunos ativos",
    text: "Use desafios, metas e conquistas para manter a comunidade engajada durante toda a jornada.",
    icon: Trophy,
    benefits: ["MissÃµes por etapa", "Reconhecimento de progresso", "Mais participaÃ§Ã£o da comunidade"],
  },
  {
    id: "comunidade",
    label: "Feed Comunidade",
    title: "Um espaÃ§o vivo para relacionamento",
    text: "ReÃºna conversas, atualizaÃ§Ãµes e conteÃºdos de bastidores em uma Ã¡rea privada com sensaÃ§Ã£o de comunidade.",
    icon: Users,
    benefits: ["PublicaÃ§Ãµes para membros", "InteraÃ§Ã£o recorrente", "Pertencimento e retenÃ§Ã£o"],
  },
  {
    id: "videos",
    label: "Feed de vÃ­deos",
    title: "ConteÃºdos rÃ¡pidos para manter presenÃ§a",
    text: "Distribua vÃ­deos curtos, avisos e pÃ­lulas de conteÃºdo em formato simples de consumir.",
    icon: Video,
    benefits: ["ConteÃºdo em sequÃªncia", "Destaques por campanha", "Mais frequÃªncia de contato"],
  },
  {
    id: "notificacoes",
    label: "NotificaÃ§Ãµes",
    title: "ComunicaÃ§Ã£o que nÃ£o se perde",
    text: "Organize avisos importantes para manter alunos e compradores informados nos momentos certos.",
    icon: Bell,
    benefits: ["Alertas para novidades", "Avisos comerciais", "ComunicaÃ§Ã£o centralizada"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Indicadores claros para decidir melhor",
    text: "Acompanhe o desempenho da sua operaÃ§Ã£o digital sem termos tÃ©cnicos ou confusÃ£o visual.",
    icon: BarChart3,
    benefits: ["VisÃ£o de crescimento", "Dados protegidos", "Leitura rÃ¡pida dos resultados"],
  },
  {
    id: "ia",
    label: "Gerente IA",
    title: "AssistÃªncia inteligente para crescer com rotina",
    text: "Use recursos de inteligÃªncia para transformar ideias, campanhas e comunicaÃ§Ã£o em aÃ§Ãµes mais previsÃ­veis.",
    icon: Bot,
    benefits: ["SugestÃµes de conteÃºdo", "Apoio para campanhas", "ComunicaÃ§Ã£o mais consistente"],
  },
  {
    id: "email",
    label: "E-mail Marketing",
    title: "Relacionamento recorrente com sua base",
    text: "Planeje mensagens, ofertas e sequÃªncias para manter sua audiÃªncia prÃ³xima da prÃ³xima compra.",
    icon: Mail,
    benefits: ["Campanhas para alunos", "SequÃªncias de venda", "AtivaÃ§Ã£o de compradores"],
  },
];

export async function MemberDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    } else {
      dashboardWarning = "Alguns dados da assinatura não puderam ser carregados agora.";
    }

    if (ordersResult.status === "fulfilled" && !ordersResult.value.error) {
      ordersData = ordersResult.value.data || [];
    } else {
      dashboardWarning = "Alguns dados do painel não puderam ser carregados agora.";
    }
  } catch {
    dashboardWarning = "Não foi possível carregar todos os dados do painel. Você ainda pode navegar normalmente.";
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
          Compra confirmada com sucesso! Seu acesso a {latestConfirmedOrder.product_name} jÃ¡ foi liberado.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[1.75rem] bg-[#05281f] text-white shadow-2xl">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#83f5aa]">Ãrea de membros premium</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Da experiÃªncia do aluno ao crescimento previsÃ­vel.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Estruture conteÃºdo, comunidade e comunicaÃ§Ã£o em um Ãºnico ecossistema que transforma engajamento em vendas recorrentes.
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
                    <p className="mt-2 text-sm leading-6 text-white/65">EspaÃ§o visual para imagem, player ou demonstraÃ§Ã£o da aba.</p>
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
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a843]">ConteÃºdo</p>
              <h2 className="mt-1 text-2xl font-black text-[#061421]">Meus cursos</h2>
            </div>
            <Link href="/dashboard/meus-cursos" className="text-sm font-black text-[#128C3E]">Ver todos</Link>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {publicCourses.map((course) => (
              <article key={course.slug} className="rounded-2xl border border-slate-200 bg-[#f8fbf7] p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <p className="text-xs font-black uppercase text-[#00a843]">{course.level}</p>
                <h3 className="mt-2 font-black text-[#061421]">{course.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                <Link href={`/cursos/${course.slug}`} className="mt-4 inline-flex rounded-full bg-[#05281f] px-4 py-2 text-sm font-black text-white">
                  Continuar
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#00a843]">PrÃ³ximas aulas</p>
          <h2 className="mt-1 text-2xl font-black text-[#061421]">Roteiro de progresso</h2>
          <div className="mt-5 grid gap-3">
            {courseModules.map((module) => (
              <div key={module.title} className="rounded-2xl bg-[#f4f8f3] p-4">
                <p className="font-black text-[#061421]">{module.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{module.lessons.length} aulas disponÃ­veis</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}


