import Link from "next/link";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { publicCourses } from "@/lib/site";

export const metadata = {
  title: "Cursos",
  description: "Catalogo inicial de cursos da MKTBR Site.",
};

export default function CursosPage() {
  return (
    <>
      <SiteHeader />
      <Section
        eyebrow="Cursos"
        title="Trilhas para marketing, vendas e automação"
        text="A estrutura está pronta para cadastrar cursos, módulos, aulas, matrículas e progresso de alunos em um ambiente seguro e independente."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {publicCourses.map((course) => (
            <Link
              key={course.slug}
              href={`/cursos/${course.slug}`}
              className="rounded-lg border border-slate-200 p-6 transition hover:border-[#00c853]"
            >
              <p className="text-xs font-black uppercase tracking-wide text-[#00c853]">
                {course.level}
              </p>
              <h2 className="mt-3 text-xl font-black">{course.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{course.description}</p>
              <p className="mt-5 text-sm font-black">{course.lessons} aulas</p>
            </Link>
          ))}
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
