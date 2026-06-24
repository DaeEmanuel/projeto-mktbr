import Link from "next/link";
import { ArrowRight, Bot, CalendarDays, Image, Sparkles, Video } from "lucide-react";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Ferramentas | MKTBR Site",
  description: "Ferramentas de IA e automacao para criadores, autores e infoprodutores.",
};

const tools = [
  {
    name: "TikTok AutoCreator",
    description:
      "Gere roteiros, titulos, legendas, hashtags e chamadas para acao para videos curtos.",
    href: "/ferramentas/tiktok-autocreator",
    icon: Video,
    tag: "Novo",
  },
  {
    name: "MKTBR Social IA",
    description:
      "Crie posts, imagens, bios, analises e calendarios de conteudo para redes sociais.",
    href: "/social-ia",
    icon: Sparkles,
    tag: "IA",
  },
  {
    name: "Calendario de Conteudo",
    description: "Organize ideias e campanhas para manter uma rotina de publicacao consistente.",
    href: "/social-ia/calendario",
    icon: CalendarDays,
    tag: "Planejamento",
  },
  {
    name: "Gerador de Imagens",
    description: "Prepare ideias visuais para campanhas, posts e divulgacao dos seus produtos.",
    href: "/social-ia/gerador-imagens",
    icon: Image,
    tag: "Criacao",
  },
  {
    name: "Assistente de Campanhas",
    description: "Estruture ofertas, angulos de venda e mensagens para melhorar conversoes.",
    href: "/social-ia/gerador-posts",
    icon: Bot,
    tag: "Marketing",
  },
];

export default function FerramentasPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Ferramentas MKTBR"
        title="Crie, organize e publique conteudo com mais velocidade"
        text="Recursos digitais para transformar ideias em campanhas, aulas, livros e videos prontos para divulgacao."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#00c853] hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-md bg-[#00c853]/10 text-[#128C3E]">
                    <Icon size={24} />
                  </span>
                  <span className="rounded-full bg-[#061421] px-3 py-1 text-xs font-black text-white">
                    {tool.tag}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-black text-[#061421]">{tool.name}</h2>
                <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">
                  {tool.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#128C3E]">
                  Acessar ferramenta
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
