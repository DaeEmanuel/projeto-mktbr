"use client";

import type { ButtonConfig } from "@/lib/bottons";
import { buttonTemplates } from "@/lib/bottons";

export function ButtonTemplates({
  onSelect,
}: {
  onSelect: (config: ButtonConfig, name: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-[#128C3E]">Biblioteca</p>
          <h2 className="text-xl font-black text-[#061421]">Modelos prontos</h2>
        </div>
        <span className="rounded-full bg-[#00c853]/10 px-3 py-1 text-xs font-black text-[#128C3E]">
          {buttonTemplates.length} modelos
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {buttonTemplates.map((template) => (
          <button
            key={`${template.category}-${template.name}`}
            type="button"
            onClick={() => onSelect(template.config, template.name)}
            className="rounded-md border border-slate-200 p-4 text-left transition hover:border-[#00c853] hover:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-[#061421]">{template.name}</p>
              {template.premium ? (
                <span className="rounded-full bg-[#061421] px-2 py-1 text-[10px] font-black text-white">
                  Premium
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs font-bold text-[#128C3E]">{template.category}</p>
            <p className="mt-2 text-sm leading-5 text-slate-600">{template.config.slogan}</p>
          </button>
        ))}
      </div>
    </div>
  );
}