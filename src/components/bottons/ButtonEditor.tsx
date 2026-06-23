"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Save, Sparkles, Trash2, Upload } from "lucide-react";
import type { ButtonConfig, ButtonGloss, ButtonImageFit, ButtonProject, PixKeyType } from "@/lib/bottons";
import { buttonCategories, defaultButtonConfig, mergeButtonConfig } from "@/lib/bottons";
import { buildPixPayload } from "@/lib/pix";
import { ButtonA4Generator } from "./ButtonA4Generator";
import { ButtonMockup } from "./ButtonMockup";
import { ButtonPreview } from "./ButtonPreview";
import { ButtonTemplates } from "./ButtonTemplates";

const fonts = ["Inter, Arial, sans-serif", "Arial Black, Arial, sans-serif", "Georgia, serif", "Verdana, sans-serif"];
const glossOptions: Array<{ value: ButtonGloss; label: string }> = [
  { value: "none", label: "Sem brilho" },
  { value: "light", label: "Leve" },
  { value: "medium", label: "Médio" },
  { value: "strong", label: "Forte" },
  { value: "premium", label: "Premium" },
  { value: "glass", label: "Vidro" },
  { value: "metallic", label: "Metálico" },
];

function getPixPayloadResult(config: ButtonConfig) {
  return buildPixPayload({
    keyType: config.pixKeyType,
    key: config.pixKey,
    receiverName: config.pixReceiverName,
    amount: config.pixAmount,
    transactionId: config.pixTransactionId,
    description: config.pixDescription,
  });
}

function getPixPayload(config: ButtonConfig) {
  const result = getPixPayloadResult(config);
  return result.ok ? result.payload : "";
}

function buildQrValue(config: ButtonConfig) {
  if (config.qrType === "whatsapp") {
    const phone = config.whatsappNumber.replace(/\D/g, "");
    const message = encodeURIComponent(config.whatsappMessage || "Olá!");
    return phone ? `https://wa.me/${phone}?text=${message}` : "";
  }
  if (config.qrType === "pix") return getPixPayload(config);
  if (config.qrType === "text") return config.freeText;
  return config.qrCodeText;
}

function buildPreviewSvg(config: ButtonConfig, options: { transparent?: boolean } = {}) {
  const radius = config.shape === "circle" ? 160 : config.shape === "rounded" ? 30 : 10;
  const defs = config.backgroundType === "gradient" ? `<defs><linearGradient id="mktbrBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${config.gradientFrom}"/><stop offset="100%" stop-color="${config.gradientTo}"/></linearGradient></defs>` : "";
  const background = options.transparent
    ? ""
    : config.backgroundType === "gradient"
      ? `<rect width="320" height="320" rx="${radius}" fill="url(#mktbrBg)"/>`
      : config.backgroundType === "image" && config.backgroundImageDataUrl
        ? `<rect width="320" height="320" rx="${radius}" fill="${config.backgroundColor}"/><image href="${config.backgroundImageDataUrl}" x="0" y="0" width="320" height="320" preserveAspectRatio="xMidYMid slice" opacity=".95"/>`
        : `<rect width="320" height="320" rx="${radius}" fill="${config.backgroundColor}"/>`;
  const accent = options.transparent ? "" : `<circle cx="80" cy="70" r="80" fill="${config.accentColor}" opacity="0.28"/>`;
  const image = config.mainImageDataUrl
    ? `<image href="${config.mainImageDataUrl}" x="${70 + config.imageX}" y="${50 + config.imageY}" width="${config.imageScale * 1.8}" height="${config.imageScale * 1.8}" preserveAspectRatio="xMidYMid ${config.imageFit === "cover" ? "slice" : "meet"}" transform="rotate(${config.imageRotation} 160 160)" opacity=".96"/>`
    : "";
  const qr = config.showQrCode ? `<rect x="${(config.qrX / 100) * 320 - config.qrSize / 2}" y="${(config.qrY / 100) * 320 - config.qrSize / 2}" width="${config.qrSize}" height="${config.qrSize}" rx="8" fill="#fff"/><text x="${(config.qrX / 100) * 320}" y="${(config.qrY / 100) * 320 + 4}" text-anchor="middle" font-size="10" font-weight="800" fill="#061421">QR</text>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="960" viewBox="0 0 320 320">
    ${defs}
    ${background}
    ${accent}
    ${image}
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

async function svgToCanvas(svg: string, scale = 1) {
  const image = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Erro ao gerar imagem."));
    image.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 960 * scale;
  canvas.height = 960 * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas nao suportado neste navegador.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas;
}

async function svgToPng(svg: string, filename: string, scale = 1) {
  const canvas = await svgToCanvas(svg, scale);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((pngBlob) => pngBlob ? resolve(pngBlob) : reject(new Error("Nao foi possivel exportar PNG.")), "image/png"));
  downloadBlob(blob, filename);
}

function stringToBytes(value: string) {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) bytes[index] = value.charCodeAt(index) & 0xff;
  return bytes;
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return stringToBytes(binary);
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

async function svgToPdf(svg: string, filename: string) {
  const canvas = await svgToCanvas(svg, 2);
  const jpeg = canvas.toDataURL("image/jpeg", 0.92);
  const imageBytes = base64ToBytes(jpeg.split(",")[1] || "");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
    "\nendstream\nendobj\n",
    "5 0 obj\n<< /Length 35 >>\nstream\nq\n420 0 0 420 87.5 240 cm\n/Im0 Do\nQ\nendstream\nendobj\n",
  ];
  const header = stringToBytes("%PDF-1.4\n");
  const chunks: Uint8Array[] = [header];
  const offsets: number[] = [];
  let cursor = header.length;
  for (let index = 0; index < objects.length; index += 1) {
    if (index === 4) continue;
    offsets.push(cursor);
    if (index === 3) {
      const before = stringToBytes(objects[3]);
      const after = stringToBytes(objects[4]);
      chunks.push(before, imageBytes, after);
      cursor += before.length + imageBytes.length + after.length;
    } else {
      const objectBytes = stringToBytes(objects[index]);
      chunks.push(objectBytes);
      cursor += objectBytes.length;
    }
  }
  const xrefOffset = cursor;
  const xref = `xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(stringToBytes(xref));
  downloadBlob(new Blob([concatBytes(chunks)], { type: "application/pdf" }), filename);
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
  const [showMobilePreview, setShowMobilePreview] = useState(true);

  const qrValue = useMemo(() => buildQrValue(config), [config]);
  const pixResult = useMemo(() => getPixPayloadResult(config), [config]);
  const pixPayload = pixResult.ok ? pixResult.payload : "";
  const previewConfig = useMemo(() => ({ ...config, qrCodeText: qrValue }), [config, qrValue]);
  const previewData = useMemo(() => makePreviewData(previewConfig), [previewConfig]);

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const response = await fetch("/api/button-projects");
    const data = await response.json().catch(() => ({}));
    if (response.ok) setProjects(data.projects || []);
  }

  function updateConfig<K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function setQrPosition(x: number, y: number) {
    setConfig((current) => ({ ...current, qrX: Math.round(x), qrY: Math.round(y) }));
  }

  async function readImageFile(file?: File) {
    if (!file) return "";
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem valida.");
      return "";
    }
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Erro ao ler imagem."));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(file?: File) {
    const dataUrl = await readImageFile(file);
    if (dataUrl) setConfig((current) => ({ ...current, mainImageDataUrl: dataUrl }));
  }

  async function handleBackgroundUpload(file?: File) {
    const dataUrl = await readImageFile(file);
    if (dataUrl) setConfig((current) => ({ ...current, backgroundType: "image", backgroundImageDataUrl: dataUrl }));
  }

  function moveQr(deltaX: number, deltaY: number) {
    setConfig((current) => ({
      ...current,
      qrX: Math.max(0, Math.min(100, current.qrX + deltaX)),
      qrY: Math.max(0, Math.min(100, current.qrY + deltaY)),
    }));
  }

  async function saveProject() {
    setError(""); setMessage(""); setIsSaving(true);
    try {
      const response = await fetch(currentProjectId ? `/api/button-projects/${currentProjectId}` : "/api/button-projects", {
        method: currentProjectId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_projeto: projectName, configuracao_json: previewConfig, imagem_preview: previewData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar o projeto.");
      setCurrentProjectId(data.project.id);
      setMessage("Projeto salvo com sucesso.");
      await fetchProjects();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Erro ao salvar projeto.");
    } finally { setIsSaving(false); }
  }

  async function duplicateProject() {
    if (!currentProjectId) { setError("Salve ou selecione um projeto antes de duplicar."); return; }
    const response = await fetch(`/api/button-projects/${currentProjectId}/duplicate`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error || "Não foi possível duplicar o projeto."); return; }
    setCurrentProjectId(data.project.id);
    setProjectName(data.project.nome_projeto);
    setConfig(mergeButtonConfig(data.project.configuracao_json));
    setMessage("Projeto duplicado.");
    await fetchProjects();
  }

  async function deleteProject() {
    if (!currentProjectId) { setError("Selecione um projeto para excluir."); return; }
    const response = await fetch(`/api/button-projects/${currentProjectId}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error || "Não foi possível excluir o projeto."); return; }
    setCurrentProjectId(null); setProjectName("Meu projeto de botton"); setConfig(defaultButtonConfig); setMessage("Projeto excluído."); await fetchProjects();
  }

  function loadProject(project: ButtonProject) {
    setCurrentProjectId(project.id);
    setProjectName(project.nome_projeto);
    setConfig(mergeButtonConfig(project.configuracao_json));
    setMessage("Projeto carregado para edição."); setError("");
  }

  async function registerDownload() {
    if (currentProjectId) await fetch(`/api/button-projects/${currentProjectId}/download`, { method: "POST" });
  }

  async function exportPng(ultra = false, transparent = false) {
    await svgToPng(buildPreviewSvg(previewConfig, { transparent }), `${projectName || "botton-mktbr"}${transparent ? "-transparente" : ""}${ultra ? "-ultra-hd" : ""}.png`, ultra ? 2 : 1);
    await registerDownload();
  }

  async function exportPdf() {
    await svgToPdf(buildPreviewSvg(previewConfig), `${projectName || "botton-mktbr"}-impressao.pdf`);
    await registerDownload();
  }

  async function exportA4() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2480" height="3508" viewBox="0 0 2480 3508"><rect width="2480" height="3508" fill="white"/>${Array.from({ length: 12 }).map((_, index) => `<g transform="translate(${160 + (index % 3) * 760} ${160 + Math.floor(index / 3) * 760}) scale(1.8)">${buildPreviewSvg(previewConfig).replace(/<\/?svg[^>]*>/g, "")}</g>`).join("")}</svg>`;
    await svgToPng(svg, `${projectName || "folha-a4-bottons"}-a4.png`);
    await registerDownload();
  }

  async function generateWithAi() {
    setIsGeneratingAi(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/openai/gerar-botton", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config, projectName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar arte com IA.");
      setConfig((current) => {
        const palette = Array.isArray(data.paleta_cores) ? data.paleta_cores : [];
        return { ...current, title: data.texto_botton || current.title, slogan: data.slogan || current.slogan, subtitle: data.descricao_arte || current.subtitle, qrCodeText: data.qr_code || current.qrCodeText, layout: ["central", "badge", "ribbon"].includes(data.layout) ? data.layout : current.layout, backgroundColor: palette[0] || current.backgroundColor, textColor: palette[1] || current.textColor, accentColor: palette[2] || current.accentColor, showQrCode: true };
      });
      setMessage(data.sugestoes_layout || "Sugestões de IA aplicadas ao botton.");
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "Erro ao gerar arte com IA."); }
    finally { setIsGeneratingAi(false); }
  }

  async function copyPix() {
    if (!pixPayload) { setError(pixResult.ok ? "Nao foi possivel gerar o Pix." : pixResult.error); return; }
    await navigator.clipboard.writeText(pixPayload);
    setMessage("Pix Copia e Cola copiado.");
  }

  function testPixFormat() {
    if (!pixResult.ok) { setError(pixResult.error); setMessage(""); return; }
    setError("");
    setMessage(`Formato Pix valido. Chave normalizada: ${pixResult.normalizedKey}. Cidade interna: ${pixResult.city}.`);
  }

  const preview = (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs font-black uppercase text-[#128C3E]">Prévia fixa</p><h2 className="text-xl font-black text-[#061421]">Arte do botton</h2></div>
        <button type="button" onClick={() => setShowMobilePreview(false)} className="text-sm font-black text-slate-500 lg:hidden">Fechar</button>
      </div>
      <div className="mt-5"><ButtonPreview config={previewConfig} onQrMove={(position) => setQrPosition(position.x, position.y)} /></div>
      <p className="mt-4 text-xs font-bold text-slate-500">O nome do projeto não entra na arte. Ele serve apenas para organizar seus projetos salvos.</p>
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="grid max-h-none gap-5 xl:max-h-[calc(100vh-130px)] xl:overflow-y-auto xl:pr-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-[#128C3E]">Editor</p>
          <h2 className="text-xl font-black text-[#061421]">Gerador Profissional de Bottons</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">Nome do projeto<input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" /></label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">Texto principal<input value={config.title} onChange={(event) => updateConfig("title", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" /></label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">Subtítulo<input value={config.subtitle} onChange={(event) => updateConfig("subtitle", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" /></label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">Slogan<input value={config.slogan} onChange={(event) => updateConfig("slogan", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-[#00c853]" /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-slate-700">Categoria<select value={config.category} onChange={(event) => updateConfig("category", event.target.value as ButtonConfig["category"])} className="min-h-11 rounded-md border border-slate-200 px-3">{buttonCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="grid gap-2 text-sm font-bold text-slate-700">Layout<select value={config.layout} onChange={(event) => updateConfig("layout", event.target.value as ButtonConfig["layout"])} className="min-h-11 rounded-md border border-slate-200 px-3"><option value="central">Central</option><option value="badge">Selo</option><option value="ribbon">Faixa</option></select></label></div>
            <div className="grid gap-3 rounded-md border border-slate-200 p-4">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Fundo
                <select value={config.backgroundType} onChange={(event) => updateConfig("backgroundType", event.target.value as ButtonConfig["backgroundType"])} className="min-h-11 rounded-md border border-slate-200 px-3">
                  <option value="solid">Cor solida</option>
                  <option value="gradient">Degrade</option>
                  <option value="image">Imagem de fundo</option>
                </select>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="grid gap-2 text-xs font-bold text-slate-700">Cor solida<input type="color" value={config.backgroundColor} onChange={(event) => updateConfig("backgroundColor", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
                <label className="grid gap-2 text-xs font-bold text-slate-700">Texto<input type="color" value={config.textColor} onChange={(event) => updateConfig("textColor", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
                <label className="grid gap-2 text-xs font-bold text-slate-700">Destaque<input type="color" value={config.accentColor} onChange={(event) => updateConfig("accentColor", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
              </div>
              {config.backgroundType === "gradient" ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Inicio do degrade<input type="color" value={config.gradientFrom} onChange={(event) => updateConfig("gradientFrom", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
                  <label className="grid gap-2 text-xs font-bold text-slate-700">Fim do degrade<input type="color" value={config.gradientTo} onChange={(event) => updateConfig("gradientTo", event.target.value)} className="h-11 w-full rounded-md border border-slate-200" /></label>
                </div>
              ) : null}
              {config.backgroundType === "image" ? (
                <label className="grid gap-2 text-sm font-bold text-slate-700">Imagem de fundo<input type="file" accept="image/*" onChange={(event) => handleBackgroundUpload(event.target.files?.[0])} className="rounded-md border border-slate-200 p-3 text-sm" /></label>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-2 text-sm font-bold text-slate-700">Formato<select value={config.shape} onChange={(event) => updateConfig("shape", event.target.value as ButtonConfig["shape"])} className="min-h-11 rounded-md border border-slate-200 px-3"><option value="circle">Redondo</option><option value="rounded">Arredondado</option><option value="square">Quadrado</option></select></label><label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Fonte<select value={config.fontFamily} onChange={(event) => updateConfig("fontFamily", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3">{fonts.map((font) => <option key={font}>{font}</option>)}</select></label></div>
            <label className="grid gap-2 text-sm font-bold text-slate-700">Qualidade do brilho<select value={config.gloss} onChange={(event) => updateConfig("gloss", event.target.value as ButtonGloss)} className="min-h-11 rounded-md border border-slate-200 px-3">{glossOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><Upload className="text-[#128C3E]" size={20} /><h2 className="text-xl font-black text-[#061421]">Enviar foto, arte ou logo</h2></div>
          <div className="mt-4 grid gap-4">
            <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleImageUpload(event.dataTransfer.files?.[0]); }} className="grid cursor-pointer place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#00c853] hover:bg-[#00c853]/5">
              <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files?.[0])} className="sr-only" />
              <span className="text-sm font-black text-[#061421]">Enviar foto, arte ou logo</span>
              <span className="mt-1 text-xs font-bold text-slate-500">Clique ou arraste uma imagem para dentro do botton</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-slate-700">Modo da imagem<select value={config.imageFit} onChange={(event) => updateConfig("imageFit", event.target.value as ButtonImageFit)} className="min-h-11 rounded-md border border-slate-200 px-3"><option value="cover">Preencher circulo</option><option value="contain">Mostrar imagem inteira</option></select></label><button type="button" onClick={() => setConfig((current) => ({ ...current, imageX: 0, imageY: 0, imageScale: 100, imageRotation: 0 }))} className="self-end min-h-11 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]">Centralizar imagem</button></div>
            {[["Mover esquerda/direita", "imageX", -120, 120], ["Mover cima/baixo", "imageY", -120, 120], ["Aumentar/diminuir", "imageScale", 30, 220], ["Girar imagem", "imageRotation", -180, 180]].map(([label, key, min, max]) => <label key={String(key)} className="grid gap-2 text-sm font-bold text-slate-700">{label}<input type="range" min={Number(min)} max={Number(max)} value={Number(config[key as keyof ButtonConfig])} onChange={(event) => updateConfig(key as keyof ButtonConfig, Number(event.target.value) as never)} /></label>)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#061421]">QR Code</h2>
          <div className="mt-4 grid gap-4">
            <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={config.showQrCode} onChange={(event) => updateConfig("showQrCode", event.target.checked)} className="size-4" />Exibir QR Code</label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">Tipo de QR Code<select value={config.qrType} onChange={(event) => updateConfig("qrType", event.target.value as ButtonConfig["qrType"])} className="min-h-11 rounded-md border border-slate-200 px-3"><option value="link">Link comum</option><option value="whatsapp">WhatsApp</option><option value="pix">Pix</option><option value="text">Texto livre</option></select></label>
            {config.qrType === "link" ? <label className="grid gap-2 text-sm font-bold text-slate-700">Link<input value={config.qrCodeText} onChange={(event) => updateConfig("qrCodeText", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3" /></label> : null}
            {config.qrType === "whatsapp" ? <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-slate-700">Número WhatsApp<input value={config.whatsappNumber} onChange={(event) => updateConfig("whatsappNumber", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3" /></label><label className="grid gap-2 text-sm font-bold text-slate-700">Mensagem<input value={config.whatsappMessage} onChange={(event) => updateConfig("whatsappMessage", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3" /></label></div> : null}
            {config.qrType === "text" ? <label className="grid gap-2 text-sm font-bold text-slate-700">Texto livre<textarea value={config.freeText} onChange={(event) => updateConfig("freeText", event.target.value)} className="min-h-24 rounded-md border border-slate-200 p-3" /></label> : null}
            {config.qrType === "pix" ? (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Tipo de chave Pix
                    <select value={config.pixKeyType} onChange={(event) => updateConfig("pixKeyType", event.target.value as PixKeyType)} className="min-h-11 rounded-md border border-slate-200 px-3">
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="celular">Celular</option>
                      <option value="email">E-mail</option>
                      <option value="aleatoria">Chave aleatoria</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Chave Pix
                    <input value={config.pixKey} onChange={(event) => updateConfig("pixKey", event.target.value)} placeholder={config.pixKeyType === "celular" ? "85991918960" : ""} className="min-h-11 rounded-md border border-slate-200 px-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Nome completo do recebedor
                    <input value={config.pixReceiverName} onChange={(event) => updateConfig("pixReceiverName", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Nome do banco
                    <input value={config.pixBankName} onChange={(event) => updateConfig("pixBankName", event.target.value)} placeholder="Apenas para organizacao" className="min-h-11 rounded-md border border-slate-200 px-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Valor opcional
                    <input value={config.pixAmount} onChange={(event) => updateConfig("pixAmount", event.target.value)} placeholder="Ex.: 29,90" className="min-h-11 rounded-md border border-slate-200 px-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Identificador da transacao
                    <input value={config.pixTransactionId} onChange={(event) => updateConfig("pixTransactionId", event.target.value)} placeholder="*** quando vazio" className="min-h-11 rounded-md border border-slate-200 px-3" />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Descricao opcional
                  <input value={config.pixDescription} onChange={(event) => updateConfig("pixDescription", event.target.value)} className="min-h-11 rounded-md border border-slate-200 px-3" />
                </label>
                <p className="rounded-md bg-slate-50 p-3 text-xs font-bold text-slate-600">Cidade usada automaticamente no Pix: BRASIL. O nome do banco nao entra no payload Pix.</p>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Pix Copia e Cola
                  <textarea readOnly value={pixPayload || (pixResult.ok ? "Preencha os dados Pix para gerar." : pixResult.error)} className="min-h-28 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={testPixFormat} className="min-h-11 rounded-md border border-[#00c853] px-4 text-sm font-black text-[#128C3E]">Testar formato Pix</button>
                  <button type="button" onClick={copyPix} className="min-h-11 rounded-md bg-[#061421] px-4 text-sm font-black text-white">Copiar Pix</button>
                </div>
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-2 text-sm font-bold text-slate-700">Tamanho<input type="range" min="36" max="120" value={config.qrSize} onChange={(event) => updateConfig("qrSize", Number(event.target.value))} /></label><label className="grid gap-2 text-sm font-bold text-slate-700">Posição horizontal<input type="range" min="0" max="100" value={config.qrX} onChange={(event) => updateConfig("qrX", Number(event.target.value))} /></label><label className="grid gap-2 text-sm font-bold text-slate-700">Posição vertical<input type="range" min="0" max="100" value={config.qrY} onChange={(event) => updateConfig("qrY", Number(event.target.value))} /></label></div>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => moveQr(0, -5)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black">↑</button><button type="button" onClick={() => moveQr(0, 5)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black">↓</button><button type="button" onClick={() => moveQr(-5, 0)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black">←</button><button type="button" onClick={() => moveQr(5, 0)} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black">→</button><button type="button" onClick={() => setQrPosition(50, 50)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black">Centralizar</button><button type="button" onClick={() => setQrPosition(76, 76)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black">Canto inferior direito</button><button type="button" onClick={() => setQrPosition(24, 76)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black">Canto inferior esquerdo</button><button type="button" onClick={() => updateConfig("showQrCode", false)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-black text-red-600">Remover QR Code</button></div>
          </div>
        </div>

        <ButtonTemplates onSelect={(templateConfig, name) => { setConfig(templateConfig); setProjectName(name); setCurrentProjectId(null); }} />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><button type="button" onClick={generateWithAi} disabled={isGeneratingAi} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#00c853] px-4 text-sm font-black text-[#061421] disabled:opacity-70">{isGeneratingAi ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}Gerar Arte com IA</button><button type="button" onClick={saveProject} disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#061421] px-4 text-sm font-black text-white disabled:opacity-70">{isSaving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}Salvar projeto</button><button type="button" onClick={duplicateProject} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]"><Copy size={17} />Duplicar</button><button type="button" onClick={deleteProject} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 px-4 text-sm font-black text-red-600"><Trash2 size={17} />Excluir</button><button type="button" onClick={() => exportPng(false)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]"><Download size={17} />PNG</button><button type="button" onClick={() => exportPng(false, true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]"><Download size={17} />PNG Transparente</button><button type="button" onClick={exportPdf} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421]"><Download size={17} />PDF para impressão</button><button type="button" onClick={() => exportPng(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#00c853] px-4 text-sm font-black text-[#128C3E]"><Download size={17} />Ultra HD</button></div>{message ? <div className="mt-4 rounded-md bg-[#00c853]/10 p-3 text-sm font-bold text-[#128C3E]">{message}</div> : null}{error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}</div>

        <div className="grid gap-5 lg:grid-cols-2"><ButtonMockup config={previewConfig} premium /><div className="rounded-lg border border-slate-200 bg-[#061421] p-5 text-white shadow-sm"><p className="text-xs font-black uppercase text-[#00c853]">Área Premium</p><h2 className="mt-2 text-2xl font-black">Recursos exclusivos</h2><div className="mt-4 grid gap-3 text-sm text-white/75">{["Exportação Ultra HD", "Mockups Premium", "Templates Premium", "Projetos ilimitados"].map((item) => <p key={item} className="rounded-md bg-white/10 p-3 font-bold">{item}</p>)}</div></div></div>
        <ButtonA4Generator config={previewConfig} onDownload={exportA4} />
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-[#061421]">Meus projetos</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.length ? projects.map((project) => <button key={project.id} type="button" onClick={() => loadProject(project)} className="rounded-md border border-slate-200 p-4 text-left hover:border-[#00c853]"><p className="font-black text-[#061421]">{project.nome_projeto}</p><p className="mt-1 text-xs text-slate-500">{new Date(project.created_at).toLocaleDateString("pt-BR")}</p><p className="mt-2 text-xs font-bold text-[#128C3E]">Downloads: {project.download_count || 0}</p></button>) : <p className="text-sm text-slate-500">Nenhum projeto salvo ainda.</p>}</div></div>
      </section>

      <aside className="hidden xl:block"><div className="sticky top-24">{preview}</div></aside>
      {showMobilePreview ? <div className="xl:hidden">{preview}</div> : <button type="button" onClick={() => setShowMobilePreview(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-[#00c853] px-5 py-3 text-sm font-black text-[#061421] shadow-lg xl:hidden">Ver prévia</button>}
    </div>
  );
}