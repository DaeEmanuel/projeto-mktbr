"use client";

import { useState } from "react";

export function CheckoutButton({
  label = "Assinar com Stripe",
  stripeUrl,
}: {
  label?: string;
  stripeUrl?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");

    if (stripeUrl) {
      window.location.href = stripeUrl;
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Nao foi possível iniciar o checkout.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="min-h-12 rounded-md bg-[#061421] px-5 text-sm font-black text-white transition hover:bg-black disabled:opacity-60"
      >
        {loading ? "Abrindo checkout..." : label}
      </button>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
    </div>
  );
}
