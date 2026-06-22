import Link from "next/link";
import { ShoppingBag, Sparkles, Store } from "lucide-react";
import { ButtonPreview } from "@/components/bottons/ButtonPreview";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonCategories, buttonTemplates } from "@/lib/bottons";

export const metadata = {
  title: "Marketplace de Bottons | MKTBR",
  description: "Loja de artes prontas para bottons criadas por usuários e designers da MKTBR.",
};

export default function MarketplaceBottonsPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Loja de Artes"
        title="Marketplace de Bottons"
        text="Compre, venda e publique modelos prontos para bottons profissionais. Uma vitrine para criadores, designers, escolas, igrejas, eventos e empreendedores."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {buttonTemplates.map((template) => (
              <article key={`${template.category}-${template.name}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#00c853]/10 px-3 py-1 text-xs font-black text-[#128C3E]">
                    {template.category}
                  </span>
                  {template.premium ? (
                    <span className="rounded-full bg-[#061421] px-3 py-1 text-xs font-black text-white">
                      Premium
                    </span>
                  ) : null}
                </div>
                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <ButtonPreview config={template.config} compact />
                </div>
                <h2 className="mt-5 text-xl font-black text-[#061421]">{template.name}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">por {template.author}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-[#128C3E]">{template.price}</p>
                  <Link href="/painel/gerador-bottons" className="rounded-md bg-[#061421] px-4 py-2 text-sm font-black text-white">
                    Usar modelo
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <aside className="grid gap-4 self-start">
            <div className="rounded-lg border border-[#00c853]/30 bg-[#00c853]/10 p-5">
              <Store className="text-[#128C3E]" size={26} />
              <h2 className="mt-3 text-2xl font-black text-[#061421]">Venda seus modelos</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Em breve, autores e criadores poderão publicar artes próprias, definir preços e vender templates diretamente no marketplace.
              </p>
              <Link href="/painel/gerador-bottons" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#00c853] px-4 text-sm font-black text-[#061421]">
                Criar arte agora
              </Link>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <ShoppingBag className="text-[#128C3E]" size={24} />
              <h3 className="mt-3 font-black text-[#061421]">Categorias</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {buttonCategories.map((category) => (
                  <span key={category} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-[#061421] p-5 text-white">
              <Sparkles className="text-[#00c853]" size={24} />
              <h3 className="mt-3 font-black">MKTBR IA</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Gere slogans, frases, QR Codes, paletas e layouts para transformar qualquer ideia em uma arte vendável.
              </p>
            </div>
          </aside>
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}