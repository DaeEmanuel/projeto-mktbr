import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  CreditCard,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  PenTool,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const site = {
  name: "MKTBR",
  shortName: "MKTBR",
  domain: "mktbr.site",
  brandTagline: "Aprenda â€¢ Publique â€¢ Venda",
  brandSlogan: "Aprenda. Publique. Venda.",
  url: "https://mktbr.site",
  slogan:
    "O ecossistema brasileiro para quem deseja aprender, criar conteúdo e vender produtos digitais em uma única plataforma.",
  stripePlanName: "Academia Pro",
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/cursos", label: "Cursos" },
  { href: "/livros", label: "Livros" },
  { href: "/social-ia", label: "MKTBR Social IA" },
  { href: "/ferramentas", label: "Ferramentas" },
  { href: "/dashboard", label: "Painel" },
  { href: "/painel/gerador-bottons", label: "Gerador de Bottons" },
  { href: "/painel/bottons", label: "Painel Bottons" },
  { href: "/marketplace/bottons", label: "Marketplace Bottons" },
  { href: "/admin/bottons", label: "Admin Bottons" },
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
    title: "Automacao Comercial para Pequenos Negocios",
    level: "Intermediario",
    lessons: 31,
    description:
      "Construa processos de aquisicao, nutricao e conversao com ferramentas modernas.",
  },
  {
    slug: "ia-para-vendas",
    title: "IA Aplicada a Vendas e Atendimento",
    level: "Avancado",
    lessons: 18,
    description:
      "Use inteligencia artificial para criar scripts, analises e experiencias melhores.",
  },
];

export const sampleBooks = [
  {
    id: "sample-whatsapp-vendas",
    slug: "whatsapp-vendas-todos-os-dias",
    title: "WhatsApp: vendas todos os dias",
    writer: "Equipe MKTBR",
    priceCents: 1990,
    description:
      "Livro pratico para criar ofertas, conversas e rotinas comerciais pelo WhatsApp.",
  },
  {
    id: "sample-automacao-negocios",
    slug: "automacao-para-pequenos-negocios",
    title: "Automacao para pequenos negocios",
    writer: "Equipe MKTBR",
    priceCents: 2990,
    description:
      "Processos simples para organizar leads, atendimento, follow-up e vendas.",
  },
  {
    id: "sample-ia-atendimento",
    slug: "ia-vendas-atendimento",
    title: "IA para vendas e atendimento",
    writer: "Equipe MKTBR",
    priceCents: 4990,
    description:
      "Como usar inteligencia artificial para melhorar scripts, analises e conversoes.",
  },
];

export const features = [
  {
    icon: GraduationCap,
    title: "Cursos online",
    text: "Catalogo, modulos, aulas e progresso preparados para alunos assinantes.",
  },
  {
    icon: CreditCard,
    title: "Assinatura Stripe",
    text: "Checkout recorrente, portal do cliente e webhook para sincronizar status.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard do aluno",
    text: "Area logada com cursos, trilhas, progresso, certificados e assinatura.",
  },
  {
    icon: BarChart3,
    title: "Gestao educacional",
    text: "Estrutura de banco para matriculas, aulas, progresso e pagamentos.",
  },
  {
    icon: ShieldCheck,
    title: "Supabase separado",
    text: "Schema independente com RLS por usuario e funcoes privadas.",
  },
  {
    icon: LockKeyhole,
    title: "Seguranca",
    text: "Chaves secretas ficam no backend e rotas criticas validam autenticacao.",
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
  "Certificados de conclusao",
  "Dashboard de progresso",
  "Suporte prioritario",
  "Gestao da assinatura via Stripe",
];

export const dashboardItems = [
  { label: "Cursos disponiveis", value: "3", icon: BookOpen },
  { label: "Aulas concluidas", value: "0", icon: CheckCircle2 },
  { label: "Certificados", value: "0", icon: Award },
  { label: "Comunidade", value: "Ativa", icon: Users },
];

export const writerDashboardItems = [
  { label: "Total vendido", value: "R$ 0,00", icon: DollarSign },
  { label: "Quantidade de vendas", value: "0", icon: BookOpen },
  { label: "Comissao do MKTBR", value: "R$ 0,00", icon: ShieldCheck },
  { label: "Liquido do escritor", value: "R$ 0,00", icon: PenTool },
];

export const adminDashboardItems = [
  { label: "Total arrecadado em comissoes", value: "R$ 0,00", icon: DollarSign },
  { label: "Livros vendidos", value: "0", icon: BookOpen },
  { label: "Escritores ativos", value: "0", icon: Users },
  { label: "Repasses pendentes", value: "R$ 0,00", icon: CreditCard },
];

export const courseModules = [
  { title: "Fundamentos", lessons: ["Estrategia", "Persona", "Oferta"] },
  { title: "Execucao", lessons: ["Calendario", "Scripts", "Campanhas"] },
  { title: "Escala", lessons: ["Metricas", "Automacao", "Otimizacao"] },
];

export const iconSet = {
  Sparkles,
  CirclePlay,
  MessageCircle,
};


