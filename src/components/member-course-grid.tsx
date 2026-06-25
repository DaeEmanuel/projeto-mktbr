"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, PlayCircle, X } from "lucide-react";
import { formatCurrency } from "@/lib/money";

type CourseCard = {
  slug: string;
  title: string;
  level: string;
  lessons: number;
  description: string;
  hasAccess?: boolean;
  status?: "Acesso liberado" | "Compra pendente" | "N?o adquirido" | "Nao adquirido";
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  status: string;
  video_url: string | null;
};

type CourseDetails = {
  course: {
    slug: string;
    title: string;
    description: string;
    level: string;
    category: string;
    type: string;
    price_cents: number;
    published_at: string | null;
    cover_url?: string | null;
    author_name: string;
    author_bio: string;
  };
  access: "Acesso liberado" | "Compra pendente" | "N?o adquirido" | "Nao adquirido";
  canWatch: boolean;
  lessons: Lesson[];
};

const tabs = ["Visão geral", "Aulas", "Detalhes", "Autor"] as const;

function formatDuration(seconds: number | null) {
  if (!seconds) return "Duração livre";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function CourseCover({ course }: { course: CourseCard | CourseDetails["course"] }) {
  const title = course.title;
  const cover = "cover_url" in course ? course.cover_url : null;

  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cover} alt="" className="h-48 w-full rounded-2xl object-cover" />;
  }

  return (
    <div className="grid h-48 place-items-center rounded-2xl bg-[#05281f] p-6 text-center text-white">
      <div>
        <PlayCircle className="mx-auto text-[#83f5aa]" size={40} />
        <p className="mt-4 text-2xl font-black">{title}</p>
        <p className="mt-2 text-sm font-bold text-white/65">MKTBR Site</p>
      </div>
    </div>
  );
}

export function MemberCourseGrid({ courses }: { courses: CourseCard[] }) {
  const [selected, setSelected] = useState<CourseCard | null>(null);
  const [details, setDetails] = useState<CourseDetails | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentAccess = details?.access || selected?.status || "Nao adquirido";
  const canWatch = Boolean(details?.canWatch || selected?.hasAccess);
  const actionLabel = canWatch && activeLesson ? "Continuar assistindo" : canWatch ? "Acessar curso" : "Comprar curso";
  const coursePrice = details?.course.price_cents || 0;

  useEffect(() => {
    if (!selected) return;
    let alive = true;

    fetch(`/api/courses/${selected.slug}/details`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar o curso.");
        return payload as CourseDetails;
      })
      .then((payload) => {
        if (!alive) return;
        setDetails(payload);
        const firstPlayable = payload.lessons.find((lesson) => lesson.video_url);
        if (firstPlayable) setActiveLesson(firstPlayable);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o curso.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const modalCourse = useMemo(() => details?.course || selected, [details, selected]);

  function openCourse(course: CourseCard) {
    setSelected(course);
    setDetails(null);
    setActiveLesson(null);
    setActiveTab(tabs[0]);
    setError("");
    setLoading(true);
  }

  return (
    <>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {courses.map((course) => (
          <button
            key={course.slug}
            type="button"
            onClick={() => openCourse(course)}
            className="rounded-2xl border border-slate-200 bg-[#f8fbf7] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#00c853] hover:shadow-lg"
          >
            <p className="text-xs font-black uppercase text-[#00a843]">{course.level}</p>
            <h3 className="mt-2 font-black text-[#061421]">{course.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>
            <span className="mt-4 inline-flex rounded-full bg-[#05281f] px-4 py-2 text-sm font-black text-white">Ver detalhes</span>
          </button>
        ))}
      </div>

      {selected && modalCourse ? (
        <div className="fixed inset-0 z-50 bg-[#02070b]/70 backdrop-blur-sm" onMouseDown={() => setSelected(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white text-[#061421] shadow-2xl sm:rounded-l-[2rem]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00a843]">{currentAccess}</p>
                <h2 className="text-xl font-black sm:text-2xl">{modalCourse.title}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="grid size-10 place-items-center rounded-full bg-slate-100 text-[#061421] hover:bg-slate-200" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <CourseCover course={modalCourse} />

              <div className="mt-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab ? "bg-[#00c853] text-[#05281f]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {loading ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Carregando detalhes do curso...</p> : null}
              {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

              {activeLesson?.video_url && canWatch ? (
                <div className="mt-5 rounded-2xl bg-[#061421] p-3">
                  <video src={activeLesson.video_url} controls className="aspect-video w-full rounded-xl bg-black" />
                  <p className="mt-3 px-1 text-sm font-black text-white">{activeLesson.title}</p>
                </div>
              ) : null}

              {activeTab === "Visão geral" ? (
                <div className="mt-5 grid gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm leading-7 text-slate-700">{details?.course.description || selected.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-600">
                      <span className="rounded-full bg-white px-3 py-1">{details?.course.category || "Cursos Online"}</span>
                      <span className="rounded-full bg-white px-3 py-1">{details?.course.type || "Curso"}</span>
                      <span className="rounded-full bg-white px-3 py-1">{coursePrice > 0 ? formatCurrency(coursePrice) : "Incluso na plataforma"}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "Aulas" ? (
                <div className="mt-5 grid gap-3">
                  <p className="font-black">Aulas disponíveis</p>
                  {(details?.lessons.length ? details.lessons : []).map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={!canWatch || !lesson.video_url}
                      onClick={() => setActiveLesson(lesson)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#00c853] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75"
                    >
                      <span>
                        <span className="block font-black text-[#061421]">{lesson.title}</span>
                        <span className="mt-1 block text-xs font-bold text-slate-500">{formatDuration(lesson.duration_seconds)}</span>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        {canWatch ? <CheckCircle2 size={14} className="text-[#00a843]" /> : <LockKeyhole size={14} />}
                        {canWatch ? "disponível" : "bloqueada"}
                      </span>
                    </button>
                  ))}
                  {!details?.lessons.length ? <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">As aulas serão exibidas aqui assim que estiverem disponíveis.</p> : null}
                </div>
              ) : null}

              {activeTab === "Detalhes" ? (
                <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p><strong>Categoria:</strong> {details?.course.category || "Cursos Online"}</p>
                  <p><strong>Tipo:</strong> {details?.course.type || "Curso"}</p>
                  <p><strong>Status:</strong> {currentAccess}</p>
                  <p><strong>Publicação:</strong> {details?.course.published_at ? new Date(details.course.published_at).toLocaleDateString("pt-BR") : "Em atualização"}</p>
                  <p className="leading-7">{details?.course.description || selected.description}</p>
                </div>
              ) : null}

              {activeTab === "Autor" ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-lg font-black">{details?.course.author_name || "Equipe MKTBR"}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{details?.course.author_bio || "Especialistas em educação digital, marketing e produtos online."}</p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
              {canWatch ? (
                <Link href={`/cursos/${selected.slug}`} className="flex min-h-12 items-center justify-center rounded-xl bg-[#00c853] px-5 text-sm font-black text-[#05281f]">
                  {actionLabel}
                </Link>
              ) : (
                <Link href="/planos" className="flex min-h-12 items-center justify-center rounded-xl bg-[#061421] px-5 text-sm font-black text-white">
                  Comprar curso
                </Link>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
