import { NextResponse } from "next/server";

function getBaseUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.TIKTOK_REDIRECT_URI;

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      return new URL(request.url).origin;
    }
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = getBaseUrl(request);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const savedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("mktbr_tiktok_oauth_state="))
    ?.split("=")[1];

  if (error) {
    return NextResponse.redirect(
      new URL(`/ferramentas/tiktok-autocreator?erro=${encodeURIComponent(error)}`, baseUrl),
    );
  }

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      new URL("/ferramentas/tiktok-autocreator?erro=tiktok-callback", baseUrl),
    );
  }

  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL("/ferramentas/tiktok-autocreator?erro=tiktok-credenciais", baseUrl),
    );
  }

  const response = NextResponse.redirect(
    new URL("/ferramentas/tiktok-autocreator?tiktok=callback-recebido", baseUrl),
  );
  response.cookies.delete("mktbr_tiktok_oauth_state");

  return response;
}
