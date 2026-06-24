"use client";

import Link from "next/link";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#f4f8f3] px-4 py-12 text-[#061421] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00a843]">Meu Painel</p>
        <h1 className="mt-3 text-3xl font-black">Não foi possível carregar o painel agora</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Seus dados continuam protegidos. Tente recarregar a área do painel ou volte para a página inicial.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-[#00c853] px-5 py-3 text-sm font-black text-[#05281f]"
          >
            Tentar novamente
          </button>
          <Link href="/" className="rounded-md border border-slate-200 px-5 py-3 text-center text-sm font-black text-[#061421]">
            Voltar para Home
          </Link>
        </div>
      </section>
    </main>
  );
}
