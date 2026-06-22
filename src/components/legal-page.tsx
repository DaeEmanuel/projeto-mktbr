import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type LegalSection = {
  title: string;
  content: ReactNode;
};

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white text-[#061421]">
        <section className="border-b border-slate-200 bg-[#061421] text-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
              MKTBR IA
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{description}</p>
            <p className="mt-6 text-sm font-bold text-white/60">
              Última atualização: {lastUpdated}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="grid gap-8">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="border-b border-slate-100 pb-8 last:border-0 last:pb-0"
                >
                  <h2 className="text-xl font-black text-[#061421]">{section.title}</h2>
                  <div className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}