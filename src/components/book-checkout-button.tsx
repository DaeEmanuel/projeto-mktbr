"use client";

import { useState } from "react";

export function BookCheckoutButton({ bookId }: { bookId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/stripe/book-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possivel iniciar a compra.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="min-h-11 rounded-md bg-[#00c853] px-4 text-sm font-black text-[#061421] disabled:opacity-60"
      >
        {loading ? "Abrindo Stripe..." : "Comprar com Stripe"}
      </button>
      {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
