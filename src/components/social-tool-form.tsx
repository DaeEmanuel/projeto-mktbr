"use client";

import { useState } from "react";

export function SocialToolForm({
  placeholder,
  result,
  feature,
}: {
  placeholder: string;
  result: string;
  feature: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input) {
      setOutput("Descreva seu objetivo para gerar uma sugestao.");
      return;
    }

    const response = await fetch("/api/social/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature, prompt: input, result }),
    });
    const data = await response.json();

    setOutput(response.ok ? data.result : data.error || "Nao foi possivel gerar agora.");
  }

  return (
    <form onSubmit={generate} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Briefing
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          className="min-h-32 rounded-md border border-slate-200 p-4 outline-none focus:border-[#00c853]"
        />
      </label>
      <button
        type="submit"
        className="min-h-12 rounded-md bg-[#061421] px-5 text-sm font-black text-white transition hover:bg-black"
      >
        Gerar com IA
      </button>
      {output ? (
        <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {output}
        </div>
      ) : null}
    </form>
  );
}
