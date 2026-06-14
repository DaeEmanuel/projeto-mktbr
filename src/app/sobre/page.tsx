import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Sobre",
  description: "Sobre a MKTBR Academy+.",
};

export default function SobrePage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Sobre"
        title="Uma academy independente para educação digital"
        text="MKTBR Academy+ foi estruturada como aplicação, banco, deploy e domínio separados, sem dependência de BairroMarketing, MD Carvalho ou BairroPay."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {["Cursos", "Assinatura", "Comunidade"].map((item) => (
            <article key={item} className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-black">{item}</h2>
              <p className="mt-3 leading-7 text-slate-600">
                Módulo preparado para evoluir com conteúdo, alunos, pagamentos e
                métricas próprias.
              </p>
            </article>
          ))}
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
