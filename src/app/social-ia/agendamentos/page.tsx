import Link from "next/link";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Agendamentos" };

export default function AgendamentosPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="MKTBR Social IA"
        title="Agendamentos"
        text="Em Breve: organize filas de publicacao, canais e datas para suas redes sociais."
      >
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <span className="rounded-full bg-[#00c853]/15 px-3 py-1 text-xs font-black text-[#128C3E]">
            Em Breve
          </span>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Esta area sera preparada para agendar posts em Instagram, Facebook,
            LinkedIn, Pinterest e Google Business quando as integracoes forem ativadas.
          </p>
          <Link
            href="/social-ia/dashboard"
            className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[#061421] px-4 text-sm font-black text-white"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
