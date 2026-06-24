import type { Metadata } from "next";
import "./globals.css";
import { AuthRecoveryRedirect } from "@/components/auth-recovery-redirect";
import { VLibrasWidget } from "@/components/vlibras-widget";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "MKTBR Site | Plataforma de cursos online",
    template: "%s | MKTBR Site",
  },
  description:
    "SaaS independente para cursos online com assinatura Stripe, Supabase, dashboard do aluno e deploy Vercel.",
  keywords: [
    "MKTBR Site",
    "cursos online",
    "plataforma de cursos",
    "assinatura Stripe",
    "SaaS educação",
  ],
  openGraph: {
    title: "MKTBR Site",
    description: site.slogan,
    url: site.url,
    siteName: site.name,
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthRecoveryRedirect />
        {children}
        <VLibrasWidget />
      </body>
    </html>
  );
}
