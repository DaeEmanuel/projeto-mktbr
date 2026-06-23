"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { translateAuthMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/browser";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ProfileForm({
  initialName,
  initialAvatarUrl,
}: {
  initialName: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const objectPreviewUrl = useRef<string | null>(null);

  function chooseAvatar(file?: File | null) {
    setMessage("");
    if (!file) return;

    if (!allowedAvatarTypes.has(file.type)) {
      setMessage("Envie uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setMessage("A foto deve ter no máximo 2MB.");
      return;
    }

    if (objectPreviewUrl.current) {
      URL.revokeObjectURL(objectPreviewUrl.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    objectPreviewUrl.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setAvatarFile(file);
  }

  async function uploadAvatar(userId: string) {
    if (!avatarFile) return avatarUrl;

    const supabase = createClient();
    const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `${userId}/avatar-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("user-avatars").upload(path, avatarFile, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("user-avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setMessage("Você precisa estar logado para atualizar o perfil.");
      return;
    }

    try {
      const uploadedAvatarUrl = await uploadAvatar(user.id);
      const { error } = await supabase.auth.updateUser({
        data: {
          name,
          avatar_url: uploadedAvatarUrl,
        },
      });

      if (error) throw new Error(error.message);

      if (objectPreviewUrl.current) {
        URL.revokeObjectURL(objectPreviewUrl.current);
        objectPreviewUrl.current = null;
      }
      setAvatarUrl(uploadedAvatarUrl);
      setPreviewUrl(uploadedAvatarUrl);
      setAvatarFile(null);
      setMessage("Perfil atualizado com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? translateAuthMessage(error.message) : "Não foi possível atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Nome
        <input
          required
          autoComplete="name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="min-h-12 rounded-md border border-slate-200 px-4 outline-none focus:border-[#00c853]"
          placeholder="Seu nome"
        />
      </label>

      <div className="rounded-2xl border border-slate-200 bg-[#f4f8f3] p-4">
        <p className="text-sm font-black text-[#061421]">Foto de perfil</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-[#05281f] text-2xl font-black text-[#83f5aa] ring-4 ring-white">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Pré-visualização da foto" className="h-full w-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase() || "M"
            )}
          </div>
          <div className="grid gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#00c853] px-5 text-sm font-black text-[#05281f] transition hover:bg-[#12df68]">
              <Upload size={18} />
              Enviar foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => chooseAvatar(event.target.files?.[0])}
              />
            </label>
            <p className="text-xs font-semibold text-slate-500">JPG, PNG ou WEBP. Tamanho máximo: 2MB.</p>
            {avatarFile ? <p className="text-xs font-black text-[#128C3E]">Selecionado: {avatarFile.name}</p> : null}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#05281f] px-5 text-sm font-black text-white transition hover:bg-[#0b3b30] disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar perfil"}
      </button>
      {message ? (
        <p className={`text-sm font-bold ${message.includes("sucesso") ? "text-[#128C3E]" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
