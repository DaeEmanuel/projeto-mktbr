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
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  const baseUrl = getBaseUrl(request);

  if (!clientKey || !redirectUri) {
    return NextResponse.redirect(
      new URL("/ferramentas/tiktok-autocreator?erro=tiktok-config", baseUrl),
    );
  }

  const state = crypto.randomUUID();
  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", clientKey);
  authUrl.searchParams.set("scope", "user.info.basic,video.publish");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("mktbr_tiktok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
