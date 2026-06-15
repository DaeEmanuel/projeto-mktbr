import {
  BarChart3,
  CalendarDays,
  Camera,
  Clock,
  ImageIcon,
  Megaphone,
  MessageCircle,
  PenLine,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";

export const socialIa = {
  name: "MKTBR Social IA",
  proUrl: "https://buy.stripe.com/8x214o7X24yNajRgVh9EI02",
  premiumUrl: "https://buy.stripe.com/bJe9AU916c1f3Vt34r9EI03",
};

export const freeLimits = [
  { label: "Posts por mes", value: "3" },
  { label: "Analise por mes", value: "1" },
  { label: "Imagens por mes", value: "2" },
];

export const socialTools = [
  {
    href: "/social-ia/gerador-posts",
    title: "Gerador de Posts",
    description: "Crie legendas, ideias, chamadas e posts prontos para redes sociais.",
    icon: PenLine,
  },
  {
    href: "/social-ia/gerador-imagens",
    title: "Gerador de Imagens",
    description: "Estruture prompts e briefings visuais para posts, campanhas e capas.",
    icon: ImageIcon,
  },
  {
    href: "/social-ia/bio-profissional",
    title: "Gerador de Bio",
    description: "Monte bios profissionais para Instagram, LinkedIn e perfis comerciais.",
    icon: UserRound,
  },
  {
    href: "/social-ia/analise-perfil",
    title: "Analise de Perfil",
    description: "Organize pontos fortes, gargalos e melhorias para perfis sociais.",
    icon: BarChart3,
  },
  {
    href: "/social-ia/calendario",
    title: "Calendario de Conteudo",
    description: "Planeje temas, formatos e frequencia de publicacao por semana.",
    icon: CalendarDays,
  },
  {
    href: "/social-ia/dashboard",
    title: "Assistente WhatsApp",
    description: "Crie respostas, campanhas e chamadas para atendimento comercial.",
    icon: MessageCircle,
  },
  {
    href: "/social-ia/dashboard",
    title: "Gerador de Campanhas",
    description: "Monte campanhas com objetivo, publico, oferta, canais e CTA.",
    icon: Megaphone,
  },
  {
    href: "/social-ia/agendamentos",
    title: "Agendamentos",
    description: "Fila de publicacoes e automacoes sociais em preparacao.",
    icon: Clock,
  },
];

export const socialPlatforms = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Pinterest",
  "Google Business",
];

export const socialPlans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    badge: "Comece agora",
    description: "Ideal para testar a criacao de conteudo com limites mensais.",
    benefits: ["3 posts/mes", "1 analise/mes", "2 imagens/mes"],
    href: "/cadastro",
    featured: false,
  },
  {
    name: "Pro",
    price: "R$ 29,90",
    badge: "⭐ MAIS POPULAR",
    description: "Libera todas as ferramentas para criar mais conteudo todos os meses.",
    benefits: ["Todas as funcionalidades", "Sem limites do plano gratuito", "Fluxos de campanha"],
    href: socialIa.proUrl,
    featured: true,
  },
  {
    name: "Premium",
    price: "R$ 49,90",
    badge: "👑 PREMIUM",
    description: "Para operacoes que querem escala, calendario e integracoes futuras.",
    benefits: ["Todas as funcionalidades", "Prioridade em recursos novos", "Preparado para integracoes"],
    href: socialIa.premiumUrl,
    featured: false,
  },
];

export const dashboardUsage = [
  { label: "Posts gerados", used: 0, limit: 3, icon: PenLine },
  { label: "Analises geradas", used: 0, limit: 1, icon: BarChart3 },
  { label: "Imagens geradas", used: 0, limit: 2, icon: Camera },
];

export const toolPageContent = {
  "gerador-posts": {
    title: "Gerador de Posts",
    eyebrow: "Social IA",
    description: "Crie ideias, legendas e chamadas para Instagram, Facebook, LinkedIn e Google Business.",
    placeholder: "Ex: post para vender um curso de marketing digital para pequenos negocios",
    result: "Sugestao: use uma abertura com dor do publico, uma dica pratica e um CTA para conhecer sua oferta.",
    feature: "post",
    icon: PenLine,
  },
  "gerador-imagens": {
    title: "Gerador de Imagens",
    eyebrow: "Criacao visual",
    description: "Monte prompts para imagens, capas, thumbnails e posts com direcao visual clara.",
    placeholder: "Ex: imagem profissional para divulgar aula gratuita de vendas",
    result: "Prompt sugerido: cena moderna, professor em ambiente digital, cores verde e azul escuro, estilo profissional.",
    feature: "image",
    icon: ImageIcon,
  },
  "bio-profissional": {
    title: "Gerador de Bio",
    eyebrow: "Perfil profissional",
    description: "Transforme sua proposta em uma bio objetiva, comercial e confiavel.",
    placeholder: "Ex: sou professora de ingles e vendo aulas online",
    result: "Bio sugerida: Ensino ingles pratico para adultos que querem destravar a conversacao. Aulas online e materiais exclusivos.",
    feature: "bio",
    icon: UserRound,
  },
  "analise-perfil": {
    title: "Analise de Perfil",
    eyebrow: "Diagnostico social",
    description: "Organize melhorias para posicionamento, conteudo, prova social e conversao.",
    placeholder: "Ex: perfil de consultoria com poucos leads pelo Instagram",
    result: "Analise: fortaleça promessa no topo do perfil, crie destaques de prova social e publique estudos de caso semanais.",
    feature: "analysis",
    icon: BarChart3,
  },
  calendario: {
    title: "Calendario de Conteudo",
    eyebrow: "Planejamento",
    description: "Planeje temas, formatos, datas e objetivos para uma rotina consistente.",
    placeholder: "Ex: calendario semanal para vender ebook e consultoria",
    result: "Semana sugerida: segunda dica rapida, quarta bastidor, sexta prova social, domingo CTA de venda.",
    feature: "calendar",
    icon: CalendarDays,
  },
};

export const socialHeroIcons = {
  Share2,
  Sparkles,
};
