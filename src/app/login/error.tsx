"use client";

import Link from "next/link";

export default function LoginError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-[#061421]">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">Não foi possível carregar o login</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Tente novamente em instantes. Se o problema continuar, volte para a Home e acesse o painel novamente.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-md bg-[#00c853] px-5 py-3 text-sm font-black text-[#061421]">
            Tentar novamente
          </button>
          <Link href="/" className="rounded-md border border-slate-200 px-5 py-3 text-center text-sm font-black">
            Voltar para Home
          </Link>
        </div>
      </section>
    </main>
  );
}
