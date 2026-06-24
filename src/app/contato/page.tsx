import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Contato",
  description: "Contato da MKTBR Site.",
};

export default function ContatoPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Contato"
        title="Fale com a MKTBR Site"
        text="Canal preparado para vendas, suporte aos alunos e dúvidas sobre assinatura."
      >
        <form className="grid max-w-2xl gap-4 rounded-lg border border-slate-200 bg-white p-6">
          {["Nome", "Email", "Telefone"].map((label) => (
            <label key={label} className="grid gap-2 text-sm font-bold text-slate-700">
              {label}
              <input className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]" />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Mensagem
            <textarea className="min-h-32 rounded-md border border-slate-200 p-4 outline-none focus:border-[#00c853]" />
          </label>
          <button className="min-h-12 rounded-md bg-[#061421] px-5 text-sm font-black text-white">
            Enviar
          </button>
        </form>
      </Section>
      <SiteFooter />
    </>
  );
}
