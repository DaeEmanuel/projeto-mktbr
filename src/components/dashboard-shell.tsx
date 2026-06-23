import Link from "next/link";
import type { ReactNode } from "react";
import { PortalButton } from "@/components/portal-button";
import { SignOutButton } from "@/components/sign-out-button";

const navigationItems = [
  ["Dashboard", "/dashboard"],
  ["Meus Cursos", "/dashboard/meus-cursos"],
  ["Minha Assinatura", "/dashboard/minha-assinatura"],
  ["Editar Perfil", "/dashboard/perfil"],
  ["Painel do escritor", "/dashboard/escritor"],
  ["Painel do administrador", "/dashboard/admin"],
  ["Marketplace de livros", "/livros"],
  ["MKTBR Social IA", "/social-ia/dashboard"],
  ["Gerador de Bottons", "/painel/gerador-bottons"],
  ["Marketplace Bottons", "/marketplace/bottons"],
  ["Admin Bottons", "/admin/bottons"],
];

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
  const planName = subscription?.plan_name || "MKTBR Pro";
  const planStatus = subscription?.status || "pendente";

  return (
    <main className="min-h-screen bg-[#f4f8f3] text-[#061421] lg:pl-80">
      <aside className="border-b border-white/10 bg-[#05281f] text-white shadow-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-80 lg:flex-col lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:block lg:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#83f5aa]">MEU PAINEL</p>
            <h1 className="mt-1 text-2xl font-black tracking-normal text-white">Central do Usuário</h1>
          </div>
          <div className="lg:hidden">
            <SignOutButton />
          </div>
        </div>

        <div className="hidden px-6 lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-inner">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="size-12 rounded-full object-cover ring-2 ring-[#00c853]" />
              ) : (
                <span className="grid size-12 place-items-center rounded-full bg-[#00c853] text-sm font-black text-[#05281f]">
                  {initial}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{displayName}</p>
                <p className="truncate text-xs font-semibold text-white/60">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#031c16] p-3">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#83f5aa]">Área Privada</p>
              <p className="mt-1 text-sm font-black text-white">{planName}</p>
              <p className="text-xs font-semibold capitalize text-white/60">Status: {planStatus}</p>
            </div>
            <div className="mt-3">
              <PortalButton />
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:mt-6 lg:grid lg:overflow-visible lg:px-6 lg:pb-6">
          {navigationItems.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black text-white transition hover:bg-white/12 lg:rounded-xl lg:border lg:px-4 lg:py-3 ${
                index === 0
                  ? "border-[#83f5aa] bg-[#00c853]/20 shadow-[inset_0_-2px_0_#83f5aa]"
                  : "border-white/10 bg-white/6"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 p-6 lg:block">
          <div className="rounded-2xl bg-white/8 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#83f5aa]">Ambiente Seguro</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Dados protegidos, acesso privado e infraestrutura profissional para sua jornada digital.
            </p>
          </div>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <section className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-7xl gap-6">{children}</div>
      </section>
    </main>
  );
}
