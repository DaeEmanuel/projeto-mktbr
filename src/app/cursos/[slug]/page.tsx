import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { courseModules, publicCourses } from "@/lib/site";

export function generateStaticParams() {
  return publicCourses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = publicCourses.find((item) => item.slug === slug);
  return { title: course?.title ?? "Curso" };
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = publicCourses.find((item) => item.slug === slug);

  if (!course) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <Section eyebrow={course.level} title={course.title} text={course.description}>
        <div className="grid gap-4 md:grid-cols-3">
          {courseModules.map((module) => (
            <article key={module.title} className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-black">{module.title}</h2>
              <div className="mt-4 grid gap-2">
                {module.lessons.map((lesson) => (
                  <p key={lesson} className="rounded-md bg-slate-50 p-3 text-sm font-bold">
                    {lesson}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
      <SiteFooter />
    </>
  );
}
