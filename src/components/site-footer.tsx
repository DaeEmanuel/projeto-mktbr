import Link from "next/link";
import { navItems, site } from "@/lib/site";

const footerGroups = [
  {
    title: "Navegação",
    links: navItems.filter((item) =>
      ["/", "/cursos", "/livros", "/ferramentas", "/planos", "/sobre", "/contato"].includes(item.href),
    ),
  },
  {
    title: "Ferramentas",
    links: navItems.filter((item) =>
      ["/social-ia", "/painel/gerador-bottons", "/painel/bottons", "/marketplace/bottons"].includes(item.href),
    ),
  },
  {
    title: "Painel",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/minha-assinatura", label: "Assinatura" },
      { href: "/dashboard/escritor", label: "Painel do escritor" },
      { href: "/admin/bottons", label: "Admin Bottons" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { href: "/contato", label: "Suporte" },
      { href: "/privacy", label: "Política de Privacidade" },
      { href: "/terms", label: "Termos de Uso" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#03080d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_2.4fr] lg:px-8">
        <div className="max-w-sm">
          <p className="text-2xl font-black">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{site.slogan}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white">{group.title}</p>
              <div className="mt-4 grid gap-2 text-sm text-white/65">
                {group.links.map((item) => (
                  <Link key={`${group.title}-${item.href}`} href={item.href} className="leading-6 transition hover:text-[#00c853]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45">
        © 2026 MKTBR Site. Plataforma independente. Acessível com VLibras. Desenvolvido por{" "}
        <a href="https://mdcarvalho.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/70 hover:text-[#00c853]">
          MD Carvalho
        </a>
        .
      </div>
    </footer>
  );
}
