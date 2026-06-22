"use client";

import type { ButtonConfig } from "@/lib/bottons";
import { ButtonPreview } from "./ButtonPreview";

export function ButtonA4Generator({ config, onDownload }: { config: ButtonConfig; onDownload: () => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#128C3E]">Folha A4</p>
          <h2 className="text-xl font-black text-[#061421]">Grade para impressão</h2>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="min-h-11 rounded-md bg-[#061421] px-4 text-sm font-black text-white transition hover:bg-black"
        >
          Exportar Folha A4
        </button>
      </div>
      <div className="mt-5 overflow-auto rounded-lg bg-slate-100 p-4">
        <div className="mx-auto grid w-[520px] grid-cols-3 gap-4 rounded-md bg-white p-6 shadow-sm">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="scale-[0.45] origin-top-left">
              <ButtonPreview config={config} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}