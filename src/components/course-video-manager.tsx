"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";

type Course = { id: string; slug: string; title: string };
type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_file_path?: string | null;
  published: boolean | null;
  courses?: { title?: string | null; slug?: string | null } | null;
};

const emptyForm = {
  lesson_id: "",
  course_id: "",
  title: "",
  description: "",
};

export function CourseVideoManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const selectedPreview = useMemo(() => (videoFile ? URL.createObjectURL(videoFile) : ""), [videoFile]);

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/admin/course-videos");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao carregar vídeos.");
        setCourses(result.courses || []);
        setLessons(result.lessons || []);
        const testCourse = (result.courses || []).find((course: Course) => course.slug === "curso-teste-mktbr") || result.courses?.[0];
        if (testCourse) setForm((current) => ({ ...current, course_id: testCourse.id }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar vídeos.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  function resetForm() {
    const testCourse = courses.find((course) => course.slug === "curso-teste-mktbr") || courses[0];
    setForm({ ...emptyForm, course_id: testCourse?.id || "" });
    setVideoFile(null);
    setMessage("");
    setError("");
  }

  function editLesson(lesson: Lesson) {
    setForm({
      lesson_id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description || "",
    });
    setVideoFile(null);
    setMessage("Editando vídeo selecionado. Envie outro MP4 para substituir o arquivo atual.");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Informe o título do vídeo.");
      return;
    }

    if (!form.course_id) {
      setError("Selecione um curso de teste.");
      return;
    }

    if (!form.lesson_id && !videoFile) {
      setError("Envie um vídeo MP4 para testar o player.");
      return;
    }

    if (videoFile && videoFile.type !== "video/mp4" && !videoFile.name.toLowerCase().endsWith(".mp4")) {
      setError("O vídeo deve estar em formato MP4.");
      return;
    }

    const formData = new FormData();
    formData.set("lesson_id", form.lesson_id);
    formData.set("course_id", form.course_id);
    formData.set("title", form.title);
    formData.set("description", form.description);
    if (videoFile) formData.set("video", videoFile);

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/course-videos", { method: "POST", body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao enviar vídeo.");
        setLessons((current) => {
          const exists = current.some((item) => item.id === result.lesson.id);
          return exists ? current.map((item) => (item.id === result.lesson.id ? result.lesson : item)) : [result.lesson, ...current];
        });
        setMessage(result.message || "Vídeo salvo com sucesso.");
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar vídeo.");
      }
    });
  }

  function deleteLesson(lesson: Lesson) {
    if (!confirm(`Excluir o vídeo "${lesson.title}"?`)) return;
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/course-videos/${lesson.id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao excluir vídeo.");
        setLessons((current) => current.filter((item) => item.id !== lesson.id));
        setMessage(result.message || "Vídeo excluído.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao excluir vídeo.");
      }
    });
  }

  return (
    <section id="videos-cursos" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#00a843]">Vídeo de teste</p>
          <h2 className="mt-1 text-2xl font-black">Testar player de cursos</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Envie uma aula em MP4 para validar upload, player e visualização antes de publicar cursos oficialmente.
          </p>
        </div>
        <a href="/cursos/curso-teste-mktbr" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#061421] px-4 py-2 text-sm font-black text-white">
          Ver curso teste
        </a>
      </div>

      {loading ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-500">Carregando vídeos...</p> : null}
      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

      <form onSubmit={submit} className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Curso de teste
          <select value={form.course_id} onChange={(event) => setForm({ ...form, course_id: event.target.value })} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]">
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Título do vídeo
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
          Descrição curta
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="rounded-lg border border-slate-200 bg-white p-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
          Upload de vídeo MP4 {form.lesson_id ? "para substituir" : ""}
          <input type="file" accept="video/mp4" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm" />
          <span className="text-xs font-semibold text-slate-500">Formato MP4, até 200 MB.</span>
        </label>
        {selectedPreview ? (
          <div className="lg:col-span-2">
            <p className="mb-2 text-sm font-black text-slate-700">Pré-visualização antes de salvar</p>
            <video src={selectedPreview} controls className="aspect-video w-full rounded-xl bg-black" />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button disabled={isPending} className="rounded-lg bg-[#00c853] px-5 py-3 text-sm font-black text-[#05281f] disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? "Enviando..." : form.lesson_id ? "Substituir vídeo" : "Enviar vídeo de teste"}
          </button>
          {form.lesson_id ? <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-black text-[#061421]">Cancelar edição</button> : null}
        </div>
      </form>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {lessons.map((lesson) => (
          <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-black text-[#061421]">{lesson.title}</p>
                <p className="mt-1 text-sm text-slate-600">{lesson.courses?.title || "Curso"}</p>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Publicado para teste</span>
            </div>
            {lesson.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.description}</p> : null}
            {lesson.video_url ? <video src={lesson.video_url} controls className="mt-4 aspect-video w-full rounded-xl bg-black" /> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => editLesson(lesson)} className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-black text-[#061421]">Substituir</button>
              <button type="button" onClick={() => deleteLesson(lesson)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">Excluir</button>
              {lesson.courses?.slug ? <a href={`/cursos/${lesson.courses.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#061421] px-3 py-2 text-xs font-black text-white">Visualizar aula</a> : null}
            </div>
          </article>
        ))}
        {!loading && lessons.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Nenhum vídeo de teste enviado ainda.</p> : null}
      </div>
    </section>
  );
}
