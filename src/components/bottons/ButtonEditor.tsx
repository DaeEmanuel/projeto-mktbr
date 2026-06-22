"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import type { ButtonConfig, ButtonProject } from "@/lib/bottons";
import { buttonCategories, defaultButtonConfig, mergeButtonConfig } from "@/lib/bottons";
import { ButtonA4Generator } from "./ButtonA4Generator";
import { ButtonMockup } from "./ButtonMockup";
import { ButtonPreview } from "./ButtonPreview";
import { ButtonTemplates } from "./ButtonTemplates";

const fonts = [
  "Inter, Arial, sans-serif",
  "Arial Black, Arial, sans-serif",
  "Georgia, serif",
  "Verdana, sans-serif",
];

function buildPreviewSvg(config: ButtonConfig) {
  const radius = config.shape === "circle" ? 160 : config.shape === "rounded" ? 30 : 10;
  const qr = config.showQrCode
    ? `<rect x="236" y="236" width="56" height="56" rx="8" fill="#fff"/><text x="264" y="269" text-anchor="middle" font-size="10" font-weight="800" fill="#061421">QR</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="960" viewBox="0 0 320 320">
    <rect width="320" height="320" rx="${radius}" fill="${config.backgroundColor}"/>
    <circle cx="80" cy="70" r="80" fill="${config.accentColor}" opacity="0.28"/>
    <rect x="16" y="16" width="288" height="288" rx="${radius}" fill="none" stroke="rgba(255,255,255,.45)"/>
    <text x="160" y="118" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="${config.textColor}" opacity="0.82">${config.subtitle}</text>
    <text x="160" y="165" text-anchor="middle" font-family="Arial" font-size="42" font-weight="900" fill="${config.textColor}">${config.title}</text>
    <text x="160" y="196" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="${config.textColor}" opacity="0.9">${config.slogan}</text>
    ${qr}
  </svg>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function svgToPng(svg: string, filename: string) {
  const image = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Erro ao gerar imagem PNG."));
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 960;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas nao suportado neste navegador.");
  }
  context.drawImage(image, 0, 0, 960, 960);
  URL.revokeObjectURL(url);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (pngBlob) resolve(pngBlob);
      else reject(new Error("Nao foi possivel exportar PNG."));
    }, "image/png");
  });

  downloadBlob(blob, filename);
}

function makePreviewData(config: ButtonConfig) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(buildPreviewSvg(config))))}`;
}

export function ButtonEditor() {
  const [config, setConfig] = useState<ButtonConfig>(defaultButtonConfig);
  const [projectName, setProjectName] = useState("Meu projeto de botton");
  const [projects, setProjects] = useState<ButtonProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const previewData = useMemo(() => makePreviewData(config), [config]);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const response = await fetch("/api/button-projects");
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setProjects(data.projects || []);
    }
  }

  function updateConfig<K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function saveProject() {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(currentProjectId ? `/api/button-projects/${currentProjectId}` : "/api/button-projects", {
        method: currentProjectId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_projeto: projectName, configuracao_json: config, imagem_preview: previewData }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel salvar o projeto.");
      }

      setCurrentProjectId(data.project.id);
      setMessage("Projeto salvo com sucesso.");
      await fetchProjects();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao salvar projeto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function duplicateProject() {
    if (!currentProjectId) {
      setError("Salve ou selecione um projeto antes de duplicar.");
      return;
    }

    const response = await fetch(`/api/button-projects/${currentProjectId}/duplicate`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Nao foi possivel duplicar o projeto.");
      return;
    }
    setCurrentProjectId(data.project.id);
    setProjectName(data.project.nome_projeto);
    setConfig(mergeButtonConfig(data.project.configuracao_json));
    setMessage("Projeto duplicado.");
    await fetchProjects();
  }

  async function deleteProject() {
    if (!currentProjectId) {
      setError("Selecione um projeto para excluir.");
      return;
    }

    const response = await fetch(`/api/button-projects/${currentProjectId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Nao foi possivel excluir o projeto.");
      return;
    }
    setCurrentProjectId(null);
    setProjectName("Meu projeto de botton");
    setConfig(defaultButtonConfig);
    setMessage("Projeto excluido.");
    await fetchProjects();
  }

  function loadProject(project: ButtonProject) {
    setCurrentProjectId(project.id);
    setProjectName(project.nome_projeto);
    setConfig(mergeButtonConfig(project.configuracao_json));
    setMessage("Projeto carregado para edicao.");
    setError("");
  }

  async function exportPng() {
    await svgToPng(buildPreviewSvg(config), `${projectName || "botton-mktbr"}.png`);
    if (currentProjectId) {
      await fetch(`/api/button-projects/${currentProjectId}/download`, { method: "POST" });
    }
  }

  async function exportA4() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2480" height="3508" viewBox="0 0 2480 3508"><rect width="2480" height="3508" fill="white"/>${Array.from({ length: 12 })
      .map((_, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 160 + col * 760;
        const y = 160 + row * 760;
        return `<g transform="translate(${x} ${y}) scale(1.8)">${buildPreviewSvg(config).replace(/<\/?svg[^>]*>/g, "")}</g>`;
      })
      .join("")}</svg>`;
    await svgToPng(svg, `${projectName || "folha-a4-bottons"}-a4.png`);
    if (currentProjectId) {
      await fetch(`/api/button-projects/${currentProjectId}/download`, { method: "POST" });
    }
  }

  async function generateWithAi() {
    setIsGeneratingAi(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/openai/gerar-botton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, projectName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel gerar arte com IA.");
      }

      setConfig((current) => {
        const palette = Array.isArray(data.paleta_cores) ? data.paleta_cores : [];

        return {
          ...current,
          title: data.texto_botton || current.title,
          slogan: data.slogan || current.slogan,
          subtitle: data.descricao_arte || current.subtitle,
          qrCodeText: data.qr_code || current.qrCodeText,
          layout: ["central", "badge", "ribbon"].includes(data.layout) ? data.layout : current.layout,
          backgroundColor: palette[0] || current.backgroundColor,
          textColor: palette[1] || current.textColor,
          accentColor: palette[2] || current.accentColor,
          showQrCode: true,
        };
      });
      setMessage(data.sugestoes_layout || "Sugestoes de IA aplicadas ao botton.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao gerar arte com IA.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="grid gap-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-[#128C3E]">Editor</p>
          <h2 className="text-xl font-black text-[#061421]">Gerador Profissional de Bottons</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Nome do projeto
              <input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Texto principal
              <input value={config.title} onChange={(event) => updateConfig("title", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Subtítulo
              <input value={config.subtitle} onChange={(event) => updateConfig("subtitle", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Slogan
              <input value={config.slogan} onChange={(event) => updateConfig("slogan", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Categoria
                <select value={config.category} onChange={(event) => updateConfig("category", event.target.value as ButtonConfig["category"])} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]">
                  {buttonCategories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Layout
                <select value={config.layout} onChange={(event) => updateConfig("layout", event.target.value as ButtonConfig["layout"])} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]">
                  <option value="central">Central</option>
                  <option value="badge">Selo</option>
                  <option value="ribbon">Faixa</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="grid gap-2 text-xs font-bold text-slate-700">Fundo<input type="color" value={config.backgroundColor} onChange={(event) => updateConfig("backgroundColor", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-700">Texto<input type="color" value={config.textColor} onChange={(event) => updateConfig("textColor", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-700">Destaque<input type="color" value={config.accentColor} onChange={(event) => updateConfig("accentColor", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
            </div>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Formato
              <select value={config.shape} onChange={(event) => updateConfig("shape", event.target.value as ButtonConfig["shape"])} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]">
                <option value="circle">Redondo</option>
                <option value="rounded">Arredondado</option>
                <option value="square">Quadrado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Fonte
              <select value={config.fontFamily} onChange={(event) => updateConfig("fontFamily", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]">
                {fonts.map((font) => <option key={font}>{font}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={config.showQrCode} onChange={(event) => updateConfig("showQrCode", event.target.checked)} className="size-4" />
              Exibir QR Code
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Link do QR Code
              <input value={config.qrCodeText} onChange={(event) => updateConfig("qrCodeText", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" />
            </label>
          </div>
        </div>

        <ButtonTemplates onSelect={(templateConfig, name) => { setConfig(templateConfig); setProjectName(name); setCurrentProjectId(null); }} />
      </aside>

      <section className="grid gap-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[#128C3E]">Prévia</p>
              <h1 className="text-2xl font-black text-[#061421]">{projectName}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={generateWithAi} disabled={isGeneratingAi} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#00c853] px-4 text-sm font-black text-[#061421] disabled:opacity-70">
                {isGeneratingAi ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                Gerar Arte com IA
              </button>
              <button type="button" onClick={saveProject} disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#061421] px-4 text-sm font-black text-white disabled:opacity-70">
                {isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                Salvar projeto
              </button>
              <button type="button" onClick={duplicateProject} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]"><Copy size={17} />Duplicar</button>
              <button type="button" onClick={deleteProject} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 px-4 text-sm font-black text-red-600"><Trash2 size={17} />Excluir</button>
              <button type="button" onClick={exportPng} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]"><Download size={17} />Exportar PNG</button>
            </div>
          </div>
          {message ? <div className="mt-4 rounded-md bg-[#00c853]/10 p-3 text-sm font-bold text-[#128C3E]">{message}</div> : null}
          {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
          <div className="mt-8"><ButtonPreview config={config} /></div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ButtonMockup config={config} premium />
          <div className="rounded-lg border border-slate-200 bg-[#061421] p-5 text-white shadow-sm">
            <p className="text-xs font-black uppercase text-[#00c853]">Plano Premium</p>
            <h2 className="mt-2 text-2xl font-black">Recursos exclusivos</h2>
            <div className="mt-4 grid gap-3 text-sm text-white/75">
              {[
                "Mockups avançados",
                "Exportação HD",
                "Templates Premium",
                "Projetos ilimitados",
              ].map((item) => <p key={item} className="rounded-md bg-white/10 p-3 font-bold">{item}</p>)}
            </div>
          </div>
        </div>

        <ButtonA4Generator config={config} onDownload={exportA4} />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#061421]">Meus projetos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.length ? projects.map((project) => (
              <button key={project.id} type="button" onClick={() => loadProject(project)} className="rounded-md border border-slate-200 p-4 text-left hover:border-[#00c853]">
                <p className="font-black text-[#061421]">{project.nome_projeto}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(project.created_at).toLocaleDateString("pt-BR")}</p>
                <p className="mt-2 text-xs font-bold text-[#128C3E]">Downloads: {project.download_count || 0}</p>
              </button>
            )) : <p className="text-sm text-slate-500">Nenhum projeto salvo ainda.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}