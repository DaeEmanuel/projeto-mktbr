"use client";

import { useState } from "react";
import { getAppUrl } from "@/lib/app-url";
import { translateAuthMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/browser";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppUrl()}/redefinir-senha`,
    });

    setLoading(false);

    if (resetError) {
      setError(translateAuthMessage(resetError.message));
      return;
    }

    setMessage("Enviamos um link de recuperacao para o seu e-mail.");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Email
        <input
          required
          autoComplete="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="voce@empresa.com"
        />
        <span className="text-xs font-semibold text-slate-500">
          Lembre-se de verificar sua caixa de spam.
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar link de recuperacao"}
      </button>
      {message ? <p className="text-sm font-bold text-[#128C3E]">{message}</p> : null}
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
    </form>
  );
}
