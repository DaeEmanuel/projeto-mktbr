import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const site = {
  name: "MKTBR Academy+",
  shortName: "MKTBR",
  domain: "mktbr.site",
  url: "https://mktbr.site",
  slogan: "Cursos online, comunidade e assinatura em uma plataforma independente.",
  stripePlanName: "Academy Pro",
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/cursos", label: "Cursos" },
  { href: "/planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export const publicCourses = [
  {
    slug: "whatsapp-marketing",
    title: "WhatsApp Marketing Profissional",
    level: "Iniciante",
    lessons: 24,
    description:
      "Aprenda campanhas, atendimento e funis simples para vender mais pelo WhatsApp.",
  },
  {
    slug: "automacao-comercial",
    title: "Automação Comercial para Pequenos Negócios",
    level: "Intermediário",
    lessons: 31,
    description:
      "Construa processos de aquisição, nutrição e conversão com ferramentas modernas.",
  },
  {
    slug: "ia-para-vendas",
    title: "IA Aplicada a Vendas e Atendimento",
    level: "Avançado",
    lessons: 18,
    description:
      "Use inteligência artificial para criar scripts, análises e experiências melhores.",
  },
];

export const features = [
  {
    icon: GraduationCap,
    title: "Cursos online",
    text: "Catálogo, módulos, aulas e progresso preparados para alunos assinantes.",
  },
  {
    icon: CreditCard,
    title: "Assinatura Stripe",
    text: "Checkout recorrente, portal do cliente e webhook para sincronizar status.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard do aluno",
    text: "Área logada com cursos, trilhas, progresso, certificados e assinatura.",
  },
  {
    icon: BarChart3,
    title: "Gestão educacional",
    text: "Estrutura de banco para matrículas, aulas, progresso e pagamentos.",
  },
  {
    icon: ShieldCheck,
    title: "Supabase separado",
    text: "Schema independente com RLS por usuário e funções privadas.",
  },
  {
    icon: LockKeyhole,
    title: "Segurança",
    text: "Chaves secretas ficam no backend e rotas críticas validam autenticação.",
  },
];

export const stats = [
  { label: "Cursos base", value: "3" },
  { label: "Aulas previstas", value: "73" },
  { label: "Plano SaaS", value: "1" },
];

export const planBenefits = [
  "Acesso a todos os cursos",
  "Novas aulas todos os meses",
  "Comunidade de alunos",
  "Certificados de conclusão",
  "Dashboard de progresso",
  "Suporte prioritário",
  "Gestão da assinatura via Stripe",
];

export const dashboardItems = [
  { label: "Cursos disponíveis", value: "3", icon: BookOpen },
  { label: "Aulas concluídas", value: "0", icon: CheckCircle2 },
  { label: "Certificados", value: "0", icon: Award },
  { label: "Comunidade", value: "Ativa", icon: Users },
];

export const courseModules = [
  { title: "Fundamentos", lessons: ["Estratégia", "Persona", "Oferta"] },
  { title: "Execução", lessons: ["Calendário", "Scripts", "Campanhas"] },
  { title: "Escala", lessons: ["Métricas", "Automação", "Otimização"] },
];

export const iconSet = {
  Sparkles,
  CirclePlay,
  MessageCircle,
};
