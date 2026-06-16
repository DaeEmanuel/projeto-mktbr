import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Boas-vindas",
  description: "Confirme seu e-mail para acessar a MKTBR Academia.",
};

export default function BoasVindasPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 px-4 py-16">
        <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
            Bem-vindo a MKTBR Academia
          </p>
          <h1 className="mt-3 text-3xl font-black text-[#061421]">Confirme seu e-mail</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Enviamos um link de confirmacao para o seu e-mail. Depois de confirmar, voce
            podera acessar o dashboard do aluno, seus cursos e sua assinatura.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c]"
            >
              Ir para login
            </Link>
            <Link
              href="/contato"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 px-5 text-sm font-black text-[#061421] transition hover:border-[#00c853]"
            >
              Preciso de ajuda
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
