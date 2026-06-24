import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const basicBenefits = [
  "Publicacao de cursos",
  "Area de alunos",
  "Certificados",
  "Suporte basico",
];

const proBenefits = [
  "Tudo do plano basico",
  "Upload ilimitado de cursos",
  "Destaque na plataforma",
  "Venda de livros no marketplace",
  "Estatisticas avancadas",
  "Suporte prioritario",
];

const basicStripeUrl = "https://buy.stripe.com/bJe28scdighv3VtdJ59EI00";
const proStripeUrl = "https://buy.stripe.com/14A14o3GMaXbcrZ20n9EI01";

export const metadata = {
  title: "Planos",
  description: "Assine a MKTBR Site com Stripe.",
};

export default function PlanosPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Assinatura"
        title="Planos MKTBR Site"
        text="Escolha o plano ideal para vender cursos online, acompanhar alunos e crescer com pagamentos via Stripe."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-3xl font-black">MKTBR</h2>
            <p className="mt-3">
              <span className="text-5xl font-black">R$ 29,90</span>
              <span className="text-slate-500"> por ano</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Ideal para quem esta comecando a publicar cursos online.
            </p>
            <div className="mt-6 grid gap-3">
              {basicBenefits.map((benefit) => (
                <p key={benefit} className="flex items-center gap-2 font-semibold">
                  <Check size={19} className="text-[#00c853]" />
                  {benefit}
                </p>
              ))}
            </div>
            <div className="mt-7">
              <a
                href={basicStripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#061421] px-5 text-sm font-black text-white transition hover:bg-black"
              >
                Assinar Agora
              </a>
            </div>
          </div>

          <div className="relative pt-5 lg:-mt-3">
            <div className="absolute left-6 top-0 z-10 rounded-full bg-[#00c853] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#061421] shadow-lg shadow-[#00c853]/25">
              ⭐ MAIS POPULAR
            </div>
            <div className="rounded-lg border-4 border-[#00c853] bg-white p-6 shadow-2xl shadow-[#00c853]/20">
              <h2 className="mt-5 text-3xl font-black">MKTBR Site Pro</h2>
              <p className="mt-3">
                <span className="text-5xl font-black">R$ 49,90</span>
                <span className="text-slate-500"> por mes</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Para criadores de conteudo, professores, escritores, infoprodutores e
                empresas que desejam escalar suas vendas e utilizar todos os recursos
                da plataforma.
              </p>
              <div className="mt-6 grid gap-3">
                {proBenefits.map((benefit) => (
                  <p key={benefit} className="flex items-center gap-2 font-semibold">
                    <Check size={19} className="text-[#00c853]" />
                    {benefit}
                  </p>
                ))}
              </div>
              <div className="mt-7">
                <CheckoutButton label="Assinar Pro" stripeUrl={proStripeUrl} />
              </div>
            </div>
          </div>
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
