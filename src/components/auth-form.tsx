"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {mode === "signup" ? (
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Nome
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
            placeholder="Seu nome"
          />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="voce@empresa.com"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Senha
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="Mínimo 6 caracteres"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:opacity-60"
      >
        {loading ? "Processando..." : mode === "signup" ? "Criar conta" : "Entrar"}
      </button>
      {message ? <p className="text-sm font-bold text-red-600">{message}</p> : null}
    </form>
  );
}
