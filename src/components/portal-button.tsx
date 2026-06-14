"use client";

import { useState } from "react";

export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possível abrir o portal.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-black text-[#061421] hover:border-[#00c853] disabled:opacity-60"
      >
        {loading ? "Abrindo..." : "Gerenciar assinatura"}
      </button>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
