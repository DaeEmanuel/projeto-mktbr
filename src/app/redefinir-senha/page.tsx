import { UpdatePasswordForm } from "@/components/update-password-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Redefinir senha",
  description: "Crie uma nova senha para acessar a MKTBR Site.",
};

export default function RedefinirSenhaPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-50 px-4 py-16">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-[#061421]">Nova senha</h1>
          <p className="mt-2 text-slate-600">Digite uma senha segura para continuar.</p>
          <div className="mt-6">
            <UpdatePasswordForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
