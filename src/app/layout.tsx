import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "MKTBR Academia | Plataforma de cursos online",
    template: "%s | MKTBR Academia",
  },
  description:
    "SaaS independente para cursos online com assinatura Stripe, Supabase, dashboard do aluno e deploy Vercel.",
  keywords: [
    "MKTBR Academia",
    "cursos online",
    "plataforma de cursos",
    "assinatura Stripe",
    "SaaS educação",
  ],
  openGraph: {
    title: "MKTBR Academia",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
