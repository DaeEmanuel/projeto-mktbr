import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const body = await request.json().catch(() => ({}));
  const config = body.config || {};
  const projectName = String(body.projectName || "Projeto de botton");

  if (!apiKey) {
    return NextResponse.json({
      descricao_arte: `Arte profissional para ${projectName}`,
      slogan: "Sua marca em destaque",
      texto_botton: config.title || "MKTBR",
      qr_code: config.qrCodeText || "https://mktbr.site",
      layout: config.layout || "central",
      sugestoes_layout: "Sugestao local aplicada. Configure OPENAI_API_KEY para gerar ideias com IA em producao.",
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Voce e um diretor de arte da MKTBR. Responda somente JSON em portugues do Brasil.",
        },
        {
          role: "user",
          content: `Crie sugestoes para um botton profissional. Projeto: ${projectName}. Configuracao: ${JSON.stringify(config)}. Retorne chaves descricao_arte, slogan, texto_botton, qr_code, layout e sugestoes_layout.`,
        },
      ],
      temperature: 0.8,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || "Erro ao gerar arte com IA." }, { status: response.status });
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "A IA nao retornou conteudo valido." }, { status: 502 });
  }

  return NextResponse.json(JSON.parse(content));
}