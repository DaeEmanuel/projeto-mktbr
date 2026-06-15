import Link from "next/link";
import { SocialToolForm } from "@/components/social-tool-form";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { toolPageContent } from "@/lib/social-ia";

export function SocialToolPage({ toolKey }: { toolKey: keyof typeof toolPageContent }) {
  const tool = toolPageContent[toolKey];
  const Icon = tool.icon;

  return (
    <>
      <SiteHeader />
      <Section eyebrow={tool.eyebrow} title={tool.title} text={tool.description}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <Icon className="text-[#00c853]" size={32} />
            <h2 className="mt-4 text-2xl font-black text-[#061421]">Limites do plano gratuito</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              O plano gratuito respeita os limites mensais do Social IA. Planos pagos
              liberam todas as funcionalidades.
            </p>
            <Link
              href="/social-ia"
              className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[#061421] px-4 text-sm font-black text-white"
            >
              Ver planos Social IA
            </Link>
          </div>
          <SocialToolForm placeholder={tool.placeholder} result={tool.result} feature={tool.feature} />
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
