import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeButtonConfig } from "@/lib/bottons";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("button_projects")
    .select("id,user_id,nome_projeto,configuracao_json,imagem_preview,download_count,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Erro ao carregar projetos." }, { status: 500 });
  }

  return NextResponse.json({ projects: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const nomeProjeto = String(body.nome_projeto || "Meu projeto de botton").trim();
  const configuracao = mergeButtonConfig(body.configuracao_json);

  const { data, error } = await supabase
    .from("button_projects")
    .insert({
      user_id: user.id,
      nome_projeto: nomeProjeto,
      configuracao_json: configuracao,
      imagem_preview: String(body.imagem_preview || ""),
    })
    .select("id,user_id,nome_projeto,configuracao_json,imagem_preview,download_count,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Erro ao salvar projeto." }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}