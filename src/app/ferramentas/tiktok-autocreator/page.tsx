import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck, Video } from "lucide-react";
import { TikTokAutoCreatorForm } from "@/components/tiktok/tiktok-autocreator-form";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "MKTBR TikTok AutoCreator",
  description:
    "Gere roteiro, titulo, legenda, hashtags e chamada para acao para videos do TikTok com IA.",
};

export default function TikTokAutoCreatorPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Ferramentas MKTBR"
        title="MKTBR TikTok AutoCreator"
        text="Transforme uma ideia simples em roteiro, titulo, legenda, hashtags e chamada para acao para preparar sua publicacao no TikTok."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <TikTokAutoCreatorForm />

          <aside className="grid gap-4">
            <div className="rounded-lg border border-[#00c853]/30 bg-[#00c853]/10 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-[#00c853] text-[#061421]">
                  <Video size={20} />
                </span>
                <div>
                  <p className="text-sm font-black uppercase text-[#128C3E]">TikTok</p>
                  <h2 className="text-xl font-black text-[#061421]">Preparar publicacao</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                Conecte sua conta quando o app oficial estiver aprovado para enviar videos pela API
                do TikTok.
              </p>
              <Link
                href="/api/tiktok/login"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#061421] px-5 text-sm font-black text-white transition hover:bg-black"
              >
                Conectar TikTok
              </Link>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                <div>
                  <h3 className="font-black">Aviso importante</h3>
                  <p className="mt-2 text-sm leading-6">
                    Publicacao automatica real no TikTok exige OAuth oficial, aprovacao do app no
                    TikTok for Developers e a permissao <strong>video.publish</strong>. Sem essa
                    aprovacao, a ferramenta prepara o conteudo e deixa a integracao pronta para
                    ativacao futura.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-black text-[#061421]">Fluxo seguro</h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                {[
                  "A chave OpenAI fica apenas no backend.",
                  "O usuario nunca recebe segredos no navegador.",
                  "O OAuth do TikTok usa variaveis de ambiente.",
                  "A publicacao real depende de token autorizado.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-[#128C3E]" size={17} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#061421] p-5 text-white">
              <ShieldCheck size={22} className="text-[#00c853]" />
              <h3 className="mt-3 font-black">Pronto para evoluir</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                As rotas de login, callback e publicacao ja existem para receber a integracao
                oficial quando as credenciais e permissoes estiverem ativas.
              </p>
            </div>
          </aside>
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
