import { NextResponse } from "next/server";

type OpenAiChoice = {
  message?: {
    content?: string | null;
  };
};

type OpenAiResponse = {
  choices?: OpenAiChoice[];
  error?: {
    message?: string;
  };
};

type GeneratedVideo = {
  title: string;
  script: string;
  caption: string;
  hashtags: string[];
  cta: string;
  publishingChecklist: string[];
};

function normalizeHashtags(hashtags: unknown) {
  if (!Array.isArray(hashtags)) {
    return [];
  }

  return hashtags
    .map((hashtag) => String(hashtag).trim())
    .filter(Boolean)
    .map((hashtag) => (hashtag.startsWith("#") ? hashtag : `#${hashtag}`))
    .slice(0, 10);
}

function parseGeneratedVideo(content: string): GeneratedVideo {
  const parsed = JSON.parse(content) as Partial<GeneratedVideo>;

  return {
    title: String(parsed.title || "").trim(),
    script: String(parsed.script || "").trim(),
    caption: String(parsed.caption || "").trim(),
    hashtags: normalizeHashtags(parsed.hashtags),
    cta: String(parsed.cta || "").trim(),
    publishingChecklist: Array.isArray(parsed.publishingChecklist)
      ? parsed.publishingChecklist.map((item) => String(item).trim()).filter(Boolean).slice(0, 8)
      : [],
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY nao configurada no servidor." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const niche = String(body.niche || "").trim();
  const tone = String(body.tone || "").trim();
  const idea = String(body.idea || "").trim();
  const duration = String(body.duration || "30").trim();

  if (!niche || !tone || !idea) {
    return NextResponse.json(
      { error: "Informe nicho, tom e ideia do video." },
      { status: 400 },
    );
  }

  try {
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
            content:
              "Voce e um estrategista de conteudo para TikTok da MKTBR Academia. Responda somente em JSON valido, em portugues do Brasil, sem markdown.",
          },
          {
            role: "user",
            content: [
              "Crie um pacote completo para um video curto no TikTok.",
              `Nicho: ${niche}.`,
              `Tom: ${tone}.`,
              `Duracao aproximada: ${duration} segundos.`,
              `Ideia/briefing: ${idea}.`,
              "Retorne exatamente as chaves: title, script, caption, hashtags, cta, publishingChecklist.",
              "script deve ter gancho inicial, desenvolvimento e fechamento.",
              "hashtags deve ser uma lista com 5 a 10 hashtags.",
              "publishingChecklist deve orientar revisao, capa, legenda, horario e CTA.",
            ].join("\n"),
          },
        ],
        temperature: 0.8,
      }),
    });

    const data = (await response.json()) as OpenAiResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Erro ao gerar conteudo com a OpenAI." },
        { status: response.status },
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "A OpenAI nao retornou conteudo valido." },
        { status: 502 },
      );
    }

    const generatedVideo = parseGeneratedVideo(content);

    if (!generatedVideo.title || !generatedVideo.script) {
      return NextResponse.json(
        { error: "Nao foi possivel interpretar o conteudo gerado." },
        { status: 502 },
      );
    }

    return NextResponse.json(generatedVideo);
  } catch (error) {
    console.error("[MKTBR TikTok AutoCreator] Falha ao gerar video", error);

    return NextResponse.json(
      { error: "Erro de conexao ao gerar conteudo." },
      { status: 500 },
    );
  }
}
