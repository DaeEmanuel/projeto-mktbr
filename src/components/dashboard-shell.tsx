import Link from "next/link";
import type { ReactNode } from "react";
import { PortalButton } from "@/components/portal-button";
import { SignOutButton } from "@/components/sign-out-button";

export function getDisplayName(user: {
  email?: string;
  user_metadata?: { name?: string; full_name?: string; avatar_url?: string };
}) {
  return user.user_metadata?.name || user.user_metadata?.full_name || user.email || "Aluno MKTBR";
}

export function DashboardShell({
  user,
  subscription,
  children,
}: {
  user: {
    email?: string;
    user_metadata?: { name?: string; full_name?: string; avatar_url?: string };
  };
  subscription?: { status?: string | null; plan_name?: string | null } | null;
  children: ReactNode;
}) {
  const displayName = getDisplayName(user);
  const avatarUrl = user.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">
              Area do aluno
            </p>
            <h1 className="text-2xl font-black text-[#061421]">Dashboard MKTBR Academia</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="size-10 rounded-full object-cover" />
              ) : (
                <span className="grid size-10 place-items-center rounded-full bg-[#00c853] text-sm font-black text-[#061421]">
                  {initial}
                </span>
              )}
              <div>
                <p className="text-sm font-black text-[#061421]">{displayName}</p>
                <p className="text-xs font-semibold text-slate-500">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">{user.email}</p>
          <div className="mt-5 rounded-md bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Assinatura</p>
            <p className="mt-1 text-lg font-black text-[#061421]">
              {subscription?.status || "pendente"}
            </p>
            <p className="text-sm text-slate-500">{subscription?.plan_name || "Academia Pro"}</p>
          </div>
          <div className="mt-4">
            <PortalButton />
          </div>
          <nav className="mt-5 grid gap-2">
            {[
              ["Dashboard", "/dashboard"],
              ["Meus Cursos", "/dashboard/meus-cursos"],
              ["Minha Assinatura", "/dashboard/minha-assinatura"],
              ["Editar Perfil", "/dashboard/perfil"],
              ["Painel do escritor", "/dashboard/escritor"],
              ["Painel do administrador", "/dashboard/admin"],
              ["Marketplace de livros", "/livros"],
              ["MKTBR Social IA", "/social-ia/dashboard"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md bg-slate-50 px-3 py-2 text-sm font-black text-[#061421] hover:bg-slate-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="grid gap-6">{children}</section>
      </div>
    </main>
  );
}
