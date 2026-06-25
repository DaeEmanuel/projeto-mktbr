"use client";

import { useState } from "react";

export function FreePlanButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function activateFreePlan() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscriptions/free", { method: "POST" });
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/cadastro?plano=gratis";
        return;
      }

      if (!response.ok) {
        setError(data.error || "Nao foi possivel ativar o plano gratis.");
        setLoading(false);
        return;
      }

      window.location.href = data.redirectTo || "/meu-painel";
    } catch {
      setError("Nao foi possivel ativar o plano gratis.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={activateFreePlan}
        disabled={loading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#00c853] px-5 text-sm font-black text-[#061421] transition hover:bg-[#00b84c] disabled:opacity-60"
      >
        {loading ? "Ativando..." : "Comecar gratis"}
      </button>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
