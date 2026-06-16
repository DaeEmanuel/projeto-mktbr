import Link from "next/link";
import { PasswordResetForm } from "@/components/password-reset-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Recuperar senha",
  description: "Recupere o acesso a sua conta MKTBR Academia.",
};

export default function RecuperarSenhaPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 px-4 py-16">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-[#061421]">Recuperar senha</h1>
          <p className="mt-2 text-slate-600">Receba um link seguro para criar uma nova senha.</p>
          <div className="mt-6">
            <PasswordResetForm />
          </div>
          <p className="mt-5 text-sm text-slate-600">
            Lembrou a senha?{" "}
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
