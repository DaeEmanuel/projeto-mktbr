import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Login",
  description: "Entre na MKTBR Academia.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 px-4 py-16">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-[#061421]">Login</h1>
          <p className="mt-2 text-slate-600">Acesse seus cursos e assinatura.</p>
          <div className="mt-6">
            <AuthForm mode="login" />
          </div>
          <p className="mt-5 text-sm text-slate-600">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-black text-[#128C3E]">
              Criar cadastro
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
