import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeButtonConfig } from "@/lib/bottons";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { data, error } = await supabase
    .from("button_projects")
    .update({
      nome_projeto: String(body.nome_projeto || "Meu projeto de botton").trim(),
      configuracao_json: mergeButtonConfig(body.configuracao_json),
      imagem_preview: String(body.imagem_preview || ""),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,user_id,nome_projeto,configuracao_json,imagem_preview,download_count,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Erro ao atualizar projeto." }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const { error } = await supabase
    .from("button_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Erro ao excluir projeto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}