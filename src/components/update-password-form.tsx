"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { translateAuthMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/browser";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    async function prepareRecoverySession() {
      try {
        const supabase = createClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.history.replaceState({}, document.title, "/redefinir-senha");
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          window.history.replaceState({}, document.title, "/redefinir-senha");
        } else {
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            throw new Error("Sessao de recuperacao nao encontrada.");
          }
        }

        if (active) {
          setSessionReady(true);
          setSessionError("");
        }
      } catch {
        if (active) {
          setSessionReady(false);
          setSessionError("Link de recuperacao invalido ou expirado. Solicite um novo link em Esqueci minha senha.");
        }
      }
    }

    void prepareRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionReady) {
      setMessage(sessionError || "Aguarde a validacao do link de recuperacao.");
      return;
    }

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
      {sessionError ? <p className="text-sm font-bold text-red-600">{sessionError}</p> : null}
      <button
        type="submit"
        disabled={loading || !sessionReady}
        className="min-h-12 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:opacity-60"
      >
        {loading ? "Salvando..." : sessionReady ? "Salvar nova senha" : "Validando link..."}
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
