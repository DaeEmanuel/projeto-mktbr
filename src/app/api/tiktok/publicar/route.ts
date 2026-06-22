import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const script = String(body.script || "").trim();

  if (!title || !script) {
    return NextResponse.json(
      { error: "Gere titulo e roteiro antes de preparar a publicacao." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      message:
        "Conteudo preparado. A publicacao automatica real exige OAuth oficial do TikTok, aprovacao do app e permissao video.publish.",
      status: "requires_tiktok_oauth_approval",
    },
    { status: 501 },
  );
}
