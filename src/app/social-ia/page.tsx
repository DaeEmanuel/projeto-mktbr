import Link from "next/link";
import { SocialFeatureGrid } from "@/components/social-feature-grid";
import { SocialPlanCard } from "@/components/social-plan-card";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { freeLimits, socialIa, socialPlatforms, socialPlans } from "@/lib/social-ia";

export const metadata = {
  title: "MKTBR Social IA",
  description: "Ferramentas de IA para posts, imagens, bio, analise e calendario de conteudo.",
};

export default function SocialIaPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow={socialIa.name}
        title="Crie conteudo, campanhas e ideias para redes sociais com IA"
        text="Um modulo integrado ao MKTBR para gerar posts, imagens, bios, analises de perfil e calendarios de conteudo em portugues Brasil."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SocialFeatureGrid />
            <div className="mt-8">
              <Link
                href="/social-ia/dashboard"
                className="inline-flex min-h-12 items-center rounded-md bg-[#061421] px-5 text-sm font-black text-white"
              >
                Acessar dashboard Social IA
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-black text-[#061421]">Plano gratuito</h2>
            <div className="mt-5 grid gap-3">
              {freeLimits.map((limit) => (
                <div key={limit.label} className="rounded-md bg-slate-50 p-4">
                  <p className="text-2xl font-black text-[#061421]">{limit.value}</p>
                  <p className="text-sm font-bold text-slate-600">{limit.label}</p>
                </div>
              ))}
            </div>
            <h3 className="mt-6 font-black text-[#061421]">Integracoes futuras</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {socialPlatforms.map((platform) => (
                <span key={platform} className="rounded-full bg-[#00c853]/10 px-3 py-1 text-xs font-black text-[#128C3E]">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Planos Social IA"
        title="Planos para criar conteudo com mais velocidade"
        text="Os planos Pro e Premium liberam todas as funcionalidades do modulo Social IA."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {socialPlans.map((plan) => (
            <SocialPlanCard key={plan.name} {...plan} />
          ))}
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
