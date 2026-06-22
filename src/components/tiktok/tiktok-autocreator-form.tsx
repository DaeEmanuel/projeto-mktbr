"use client";

import { useMemo, useState } from "react";
import { Copy, Loader2, Send, WandSparkles } from "lucide-react";

type GeneratedVideo = {
  title: string;
  script: string;
  caption: string;
  hashtags: string[];
  cta: string;
  publishingChecklist: string[];
};

const defaultGeneratedVideo: GeneratedVideo = {
  title: "",
  script: "",
  caption: "",
  hashtags: [],
  cta: "",
  publishingChecklist: [],
};

const tones = [
  "Educativo",
  "Profissional",
  "Divertido",
  "Inspirador",
  "Vendedor",
  "Direto ao ponto",
];

const niches = [
  "Cursos online",
  "Livros e autores",
  "Marketing digital",
  "Vendas",
  "Beleza",
  "Gastronomia",
  "Saude e bem-estar",
  "Negocios locais",
  "Educacao",
  "Tecnologia",
];

function formatContent(video: GeneratedVideo) {
  return [
    `Titulo: ${video.title}`,
    "",
    "Roteiro:",
    video.script,
    "",
    `Legenda: ${video.caption}`,
    "",
    `Hashtags: ${video.hashtags.join(" ")}`,
    "",
    `CTA: ${video.cta}`,
  ].join("\n");
}

export function TikTokAutoCreatorForm() {
  const [niche, setNiche] = useState(niches[0]);
  const [tone, setTone] = useState(tones[0]);
  const [idea, setIdea] = useState("");
  const [duration, setDuration] = useState("30");
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo>(defaultGeneratedVideo);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const hasResult = Boolean(generatedVideo.title || generatedVideo.script);
  const copyText = useMemo(() => formatContent(generatedVideo), [generatedVideo]);

  async function generateVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!idea.trim()) {
      setError("Descreva a ideia do video antes de gerar o roteiro.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/openai/gerar-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, tone, idea, duration }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel gerar o video agora.");
      }

      setGeneratedVideo({
        title: data.title || "",
        script: data.script || "",
        caption: data.caption || "",
        hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
        cta: data.cta || "",
        publishingChecklist: Array.isArray(data.publishingChecklist)
          ? data.publishingChecklist
          : [],
      });
      setStatus("Conteudo gerado com sucesso.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao gerar conteudo.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function preparePublication() {
    setError("");
    setStatus("");

    if (!hasResult) {
      setError("Gere o conteudo antes de preparar a publicacao.");
      return;
    }

    setIsPreparing(true);

    try {
      const response = await fetch("/api/tiktok/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, tone, duration, ...generatedVideo }),
      });
      const data = await response.json();

      if (!response.ok && response.status !== 501) {
        throw new Error(data.error || "Nao foi possivel preparar a publicacao.");
      }

      setStatus(data.message || "Publicacao preparada para integracao oficial do TikTok.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao preparar publicacao.");
    } finally {
      setIsPreparing(false);
    }
  }

  async function copyGeneratedContent() {
    if (!hasResult) {
      return;
    }

    await navigator.clipboard.writeText(copyText);
    setStatus("Conteudo copiado para a area de transferencia.");
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <form onSubmit={generateVideo} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Nicho
            <select
              value={niche}
              onChange={(event) => setNiche(event.target.value)}
              className="min-h-12 rounded-md border border-slate-200 bg-white px-4 outline-none focus:border-[#00c853]"
            >
              {niches.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Tom do video
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="min-h-12 rounded-md border border-slate-200 bg-white px-4 outline-none focus:border-[#00c853]"
            >
              {tones.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Duracao
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="min-h-12 rounded-md border border-slate-200 bg-white px-4 outline-none focus:border-[#00c853]"
            >
              <option value="15">15 segundos</option>
              <option value="30">30 segundos</option>
              <option value="45">45 segundos</option>
              <option value="60">60 segundos</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Ideia do video
          <textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="Exemplo: Quero vender meu curso de marketing para pequenos negocios com uma dica pratica para empreendedores."
            className="min-h-36 rounded-md border border-slate-200 p-4 leading-6 outline-none focus:border-[#00c853]"
          />
        </label>

        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <WandSparkles size={18} />}
          {isGenerating ? "Gerando..." : "Gerar roteiro com ChatGPT"}
        </button>
      </form>

      {error ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="mt-5 rounded-md border border-[#00c853]/30 bg-[#00c853]/10 p-4 text-sm font-bold text-[#128C3E]">
          {status}
        </div>
      ) : null}

      {hasResult ? (
        <div className="mt-6 grid gap-4">
          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-xs font-black uppercase text-[#128C3E]">Titulo</p>
            <h2 className="mt-2 text-2xl font-black text-[#061421]">{generatedVideo.title}</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-xs font-black uppercase text-[#128C3E]">Roteiro</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {generatedVideo.script}
              </p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-black uppercase text-[#128C3E]">Legenda</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{generatedVideo.caption}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-black uppercase text-[#128C3E]">Hashtags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {generatedVideo.hashtags.map((hashtag) => (
                    <span
                      key={hashtag}
                      className="rounded-full bg-[#00c853]/10 px-3 py-1 text-xs font-black text-[#128C3E]"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-5">
                <p className="text-xs font-black uppercase text-[#128C3E]">Chamada para acao</p>
                <p className="mt-3 text-sm font-bold leading-7 text-slate-700">{generatedVideo.cta}</p>
              </div>
            </div>
          </div>

          {generatedVideo.publishingChecklist.length ? (
            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-xs font-black uppercase text-[#128C3E]">Checklist de publicacao</p>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {generatedVideo.publishingChecklist.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-black text-[#00c853]">OK</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={preparePublication}
              disabled={isPreparing}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#061421] px-5 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPreparing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isPreparing ? "Preparando..." : "Preparar publicacao para TikTok"}
            </button>
            <button
              type="button"
              onClick={copyGeneratedContent}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 px-5 text-sm font-black text-[#061421] transition hover:border-[#00c853]"
            >
              <Copy size={18} />
              Copiar conteudo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
