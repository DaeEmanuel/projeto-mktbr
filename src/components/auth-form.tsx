"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAppUrl } from "@/lib/app-url";
import { translateAuthMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${getAppUrl()}/auth/callback?next=/meu-painel`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(translateAuthMessage(result.error.message));
      return;
    }

    if (mode === "signup") {
      router.push("/boas-vindas");
      router.refresh();
      return;
    }

    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    router.push(redirectTo || "/meu-painel");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {mode === "signup" ? (
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Nome
          <input
            required
            autoComplete="name"
            id="name"
            name="name"
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
          autoComplete="email"
          name="email"
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
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
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
      {mode === "login" ? (
        <Link href="/recuperar-senha" className="-mt-2 text-sm font-black text-[#128C3E]">
          Esqueci minha senha
        </Link>
      ) : null}
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

