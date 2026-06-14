import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Cadastro",
  description: "Crie sua conta MKTBR Academy+.",
};

export default function CadastroPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 px-4 py-16">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-[#061421]">Cadastro</h1>
          <p className="mt-2 text-slate-600">Crie sua conta para acessar a academy.</p>
          <div className="mt-6">
            <AuthForm mode="signup" />
          </div>
          <p className="mt-5 text-sm text-slate-600">
            Já tem conta?{" "}
            <Link href="/login" className="font-black text-[#128C3E]">
              Entrar
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
