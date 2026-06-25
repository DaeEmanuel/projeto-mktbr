import { notFound } from "next/navigation";
import { Section } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedLessonsByCourseSlug } from "@/lib/course-lessons";
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

  const publishedLessons = await getPublishedLessonsByCourseSlug(slug);

  return (
    <>
      <SiteHeader />
      <Section eyebrow={course.level} title={course.title} text={course.description}>
        {publishedLessons.length > 0 ? (
          <div className="grid gap-5">
            {publishedLessons.map((lesson) => (
              <article key={lesson.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#00c853]">Aula em teste</p>
                    <h2 className="mt-2 text-2xl font-black text-[#061421]">{lesson.title}</h2>
                    {lesson.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.description}</p> : null}
                  </div>
                  {lesson.video_url ? <video src={lesson.video_url} controls className="aspect-video w-full rounded-xl bg-black" /> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
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
        )}
      </Section>
      <SiteFooter />
    </>
  );
}
