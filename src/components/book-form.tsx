"use client";

import { useState } from "react";

export function BookForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceReais, setPriceReais] = useState("19.90");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priceReais }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Nao foi possivel cadastrar o livro.");
      return;
    }

    setTitle("");
    setDescription("");
    setPriceReais("19.90");
    setMessage("Livro cadastrado e publicado com sucesso.");
  }

  return (
    <form onSubmit={createBook} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-xl font-black text-[#061421]">Cadastrar livro</h2>
        <p className="mt-1 text-sm font-bold text-[#128C3E]">
          Taxa da plataforma: R$ 5,00 por venda.
        </p>
      </div>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Titulo
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Descricao
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 rounded-md border border-slate-200 p-4 outline-none focus:border-[#00c853]"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Preco de venda em reais
        <input
          required
          type="number"
          min="5.01"
          step="0.01"
          value={priceReais}
          onChange={(event) => setPriceReais(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#061421] px-5 text-sm font-black text-white disabled:opacity-60"
      >
        {loading ? "Cadastrando..." : "Publicar livro"}
      </button>
      {message ? <p className="text-sm font-bold text-slate-700">{message}</p> : null}
    </form>
  );
}
