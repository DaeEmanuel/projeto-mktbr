import type { ButtonConfig } from "@/lib/bottons";
import { ButtonPreview } from "./ButtonPreview";

export function ButtonMockup({ config, premium = false }: { config: ButtonConfig; premium?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#128C3E]">Mockup</p>
          <h2 className="text-xl font-black text-[#061421]">Prévia profissional</h2>
        </div>
        {premium ? (
          <span className="rounded-full bg-[#061421] px-3 py-1 text-xs font-black text-white">
            Premium
          </span>
        ) : null}
      </div>
      <div className="mt-5 rounded-lg bg-[linear-gradient(135deg,#f8fafc,#e2e8f0)] p-6">
        <div className="mx-auto max-w-sm rounded-full bg-black/10 p-5 shadow-inner">
          <ButtonPreview config={config} compact />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Mockups avançados e exportação HD fazem parte do plano premium do Gerador Profissional de Bottons.
      </p>
    </div>
  );
}