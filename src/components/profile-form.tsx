"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { translateAuthMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/browser";

export function ProfileForm({
  initialName,
  initialAvatarUrl,
}: {
  initialName: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        name,
        avatar_url: avatarUrl,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(translateAuthMessage(error.message));
      return;
    }

    setMessage("Perfil atualizado com sucesso.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Nome
        <input
          required
          autoComplete="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="Seu nome"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Foto de perfil
        <input
          autoComplete="url"
          name="avatar_url"
          type="url"
          value={avatarUrl}
          onChange={(event) => setAvatarUrl(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="https://exemplo.com/sua-foto.jpg"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar perfil"}
      </button>
      {message ? (
        <p className={`text-sm font-bold ${message.includes("sucesso") ? "text-[#128C3E]" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
