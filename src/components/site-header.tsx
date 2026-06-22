import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { navItems, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061421]/96 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3.5" aria-label="MKTBR">
          <span className="grid size-11 place-items-center rounded-md bg-[#00c853] text-[#061421] sm:size-12">
            <GraduationCap size={27} strokeWidth={2.5} />
          </span>
          <span>
            <span className="block text-2xl font-black leading-6 tracking-normal sm:text-[1.65rem]">{site.name}</span>
            <span className="hidden text-xs text-white/60 sm:block">{site.brandTagline}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-bold text-white/75 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#00c853]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-bold text-white/80 sm:block">
            Login
          </Link>
          <ButtonLink href="/cadastro">Começar</ButtonLink>
        </div>
      </div>
    </header>
  );
}
