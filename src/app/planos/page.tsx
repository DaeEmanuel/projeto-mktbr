import { Check } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { planBenefits, site } from "@/lib/site";

export const metadata = {
  title: "Planos",
  description: "Assine a MKTBR Academy+ com Stripe.",
};

export default function PlanosPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Assinatura"
        title="Plano Academy Pro"
        text="Acesso completo aos cursos, comunidade, certificados e novas aulas com pagamento recorrente via Stripe."
      >
        <div className="mx-auto max-w-xl rounded-lg border-2 border-[#00c853] bg-white p-6 shadow-xl shadow-[#00c853]/10">
          <span className="rounded-full bg-[#00c853] px-3 py-1 text-xs font-black text-[#061421]">
            LANÇAMENTO
          </span>
          <h2 className="mt-5 text-3xl font-black">{site.stripePlanName}</h2>
          <p className="mt-3">
            <span className="text-5xl font-black">Stripe</span>
            <span className="text-slate-500"> assinatura mensal</span>
          </p>
          <div className="mt-6 grid gap-3">
            {planBenefits.map((benefit) => (
              <p key={benefit} className="flex items-center gap-2 font-semibold">
                <Check size={19} className="text-[#00c853]" />
                {benefit}
              </p>
            ))}
          </div>
          <div className="mt-7">
            <CheckoutButton />
          </div>
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
