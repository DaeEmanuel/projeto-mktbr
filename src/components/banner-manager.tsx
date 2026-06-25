"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";

type Banner = {
  id: string;
  title: string | null;
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;
  image_url?: string | null;
  redirect_url?: string | null;
  link_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  display_order: number | null;
  is_active?: boolean | null;
  active?: boolean | null;
};

type FormState = {
  id?: string;
  title: string;
  redirect_url: string;
  start_date: string;
  end_date: string;
  display_order: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  title: "",
  redirect_url: "",
  start_date: "",
  end_date: "",
  display_order: "0",
  is_active: true,
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "Sem agendamento";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function isActive(banner: Banner) {
  return banner.is_active ?? banner.active ?? false;
}

function previewUrl(banner: Banner) {
  return banner.desktop_image_url || banner.image_url || banner.mobile_image_url || "";
}

export function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
    [banners],
  );

  function resetForm() {
    setForm(emptyForm);
    setDesktopFile(null);
    setMobileFile(null);
    setError("");
    setMessage("");
  }

  function editBanner(banner: Banner) {
    setForm({
      id: banner.id,
      title: banner.title || "",
      redirect_url: banner.redirect_url || banner.link_url || "",
      start_date: toInputDate(banner.start_date),
      end_date: toInputDate(banner.end_date),
      display_order: String(banner.display_order || 0),
      is_active: isActive(banner),
    });
    setDesktopFile(null);
    setMobileFile(null);
    setError("");
    setMessage("Editando banner selecionado.");
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Informe o título interno do banner.");
      return;
    }

    if (!form.id && !desktopFile) {
      setError("Envie a imagem desktop do banner.");
      return;
    }

    const formData = new FormData();
    formData.set("title", form.title);
    formData.set("redirect_url", form.redirect_url);
    formData.set("start_date", form.start_date);
    formData.set("end_date", form.end_date);
    formData.set("display_order", form.display_order);
    formData.set("is_active", String(form.is_active));
    if (desktopFile) formData.set("desktop_image", desktopFile);
    if (mobileFile) formData.set("mobile_image", mobileFile);

    startTransition(async () => {
      try {
        const response = await fetch(form.id ? `/api/admin/banners/${form.id}` : "/api/admin/banners", {
          method: form.id ? "PATCH" : "POST",
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao salvar banner.");
        setMessage(result.message || "Banner salvo com sucesso.");
        setBanners((current) => {
          const existing = current.some((item) => item.id === result.banner.id);
          return existing ? current.map((item) => (item.id === result.banner.id ? result.banner : item)) : [result.banner, ...current];
        });
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar banner.");
      }
    });
  }

  function toggleBanner(banner: Banner) {
    setError("");
    setMessage("");
    const formData = new FormData();
    formData.set("action", "toggle");
    formData.set("is_active", String(!isActive(banner)));

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/banners/${banner.id}`, { method: "PATCH", body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao alterar status.");
        setBanners((current) => current.map((item) => (item.id === banner.id ? result.banner : item)));
        setMessage(result.message || "Status atualizado.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao alterar status.");
      }
    });
  }

  function deleteBanner(banner: Banner) {
    if (!confirm(`Excluir o banner "${banner.title || "sem título"}"?`)) return;
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao excluir banner.");
        setBanners((current) => current.filter((item) => item.id !== banner.id));
        setMessage(result.message || "Banner excluído.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao excluir banner.");
      }
    });
  }

  return (
    <section id="banners" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#00a843]">Gerenciar Banners</p>
          <h2 className="mt-1 text-2xl font-black">Banners e slides da Home</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Cadastre imagens desktop e mobile, defina período de exibição, ordem, status e link de redirecionamento.
          </p>
        </div>
        <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-[#061421]">
          Novo banner
        </button>
      </div>

      {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

      <form onSubmit={submitForm} className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Título interno do banner *
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Link de redirecionamento
          <input value={form.redirect_url} onChange={(event) => setForm({ ...form, redirect_url: event.target.value })} placeholder="https://..." className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Upload da imagem desktop {form.id ? "" : "*"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setDesktopFile(event.target.files?.[0] || null)} className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm" />
          <span className="text-xs font-semibold text-slate-500">JPG, PNG ou WEBP até 5 MB.</span>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Upload da imagem mobile
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setMobileFile(event.target.files?.[0] || null)} className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm" />
          <span className="text-xs font-semibold text-slate-500">Opcional. Se vazio, a imagem desktop será usada.</span>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Data inicial de exibição
          <input type="datetime-local" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Data final de exibição
          <input type="datetime-local" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Ordem do slide
          <input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-[#00c853]" />
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="size-4 accent-[#00c853]" />
          Status ativo
        </label>
        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button disabled={isPending} className="rounded-lg bg-[#00c853] px-5 py-3 text-sm font-black text-[#05281f] disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? "Salvando..." : form.id ? "Salvar alterações" : "Cadastrar banner"}
          </button>
          {form.id ? (
            <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-black text-[#061421]">
              Cancelar edição
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-3">Prévia</th>
              <th>Título</th>
              <th>Status</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Link</th>
              <th>Ordem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedBanners.map((banner) => (
              <tr key={banner.id} className="border-t border-slate-100 align-middle">
                <td className="py-3">
                  {previewUrl(banner) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl(banner)} alt="" className="h-14 w-28 rounded-lg object-cover ring-1 ring-slate-200" />
                  ) : (
                    <span className="grid h-14 w-28 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400">Sem imagem</span>
                  )}
                </td>
                <td className="max-w-56 font-black text-[#061421]">{banner.title}</td>
                <td>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${isActive(banner) ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {isActive(banner) ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>{formatDate(banner.start_date)}</td>
                <td>{formatDate(banner.end_date)}</td>
                <td className="max-w-56 truncate">{banner.redirect_url || banner.link_url || "-"}</td>
                <td>{banner.display_order || 0}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => editBanner(banner)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-[#061421]">Editar</button>
                    <button type="button" onClick={() => toggleBanner(banner)} className="rounded-lg bg-[#061421] px-3 py-2 text-xs font-black text-white">
                      {isActive(banner) ? "Desativar" : "Ativar"}
                    </button>
                    <button type="button" onClick={() => deleteBanner(banner)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedBanners.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Nenhum banner cadastrado.</p> : null}
      </div>
    </section>
  );
}
