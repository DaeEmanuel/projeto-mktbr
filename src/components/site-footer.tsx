import Link from "next/link";
import { navItems, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-[#03080d] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-2xl font-black">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{site.slogan}</p>
        </div>
        <div>
          <p className="font-black">Navegação</p>
          <div className="mt-4 grid gap-2 text-sm text-white/65">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#00c853]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-black">Aluno</p>
          <div className="mt-4 grid gap-2 text-sm text-white/65">
            <Link href="/dashboard" className="hover:text-[#00c853]">
              Dashboard
            </Link>
            <Link href="/planos" className="hover:text-[#00c853]">
              Assinatura
            </Link>
            <Link href="/contato" className="hover:text-[#00c853]">
              Suporte
            </Link>
            <Link href="/privacy" className="hover:text-[#00c853]">
              Política de Privacidade
            </Link>
            <Link href="/terms" className="hover:text-[#00c853]">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45">
        © 2026 MKTBR Academia. Plataforma independente. Acessível com VLibras. Desenvolvido por{" "}
        <a href="https://mdcarvalho.com" target="_blank" rel="noopener noreferrer">
          MD Carvalho
        </a>
        .
      </div>
    </footer>
  );
}