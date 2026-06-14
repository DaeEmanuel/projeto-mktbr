import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "MKTBR Academy+ | Plataforma de cursos online",
    template: "%s | MKTBR Academy+",
  },
  description:
    "SaaS independente para cursos online com assinatura Stripe, Supabase, dashboard do aluno e deploy Vercel.",
  keywords: [
    "MKTBR Academy+",
    "cursos online",
    "plataforma de cursos",
    "assinatura Stripe",
    "SaaS educação",
  ],
  openGraph: {
    title: "MKTBR Academy+",
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
