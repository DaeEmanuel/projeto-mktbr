import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { data: project, error: loadError } = await supabase
    .from("button_projects")
    .select("nome_projeto,configuracao_json,imagem_preview")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (loadError || !project) {
    return NextResponse.json({ error: "Projeto nao encontrado." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("button_projects")
    .insert({
      user_id: user.id,
      nome_projeto: `${project.nome_projeto} - copia`,
      configuracao_json: project.configuracao_json,
      imagem_preview: project.imagem_preview,
    })
    .select("id,user_id,nome_projeto,configuracao_json,imagem_preview,download_count,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Erro ao duplicar projeto." }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}