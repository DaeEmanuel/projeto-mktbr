"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { translateAuthMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/browser";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(translateAuthMessage(error.message));
      return;
    }

    setMessage("Senha alterada com sucesso");
    window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Nova senha
        <input
          required
          autoComplete="new-password"
          id="password"
          minLength={8}
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="Minimo 8 caracteres"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar nova senha"}
      </button>
      {message ? (
        <p
          className={`text-sm font-bold ${
            message.includes("sucesso") ? "text-[#128C3E]" : "text-red-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
