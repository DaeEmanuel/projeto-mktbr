import { LegalPage } from "@/components/legal-page";
import { legalInfo, termsSections } from "@/lib/legal";

export const metadata = {
  title: "Termos de Uso | MKTBR IA",
  description:
    "Termos de Uso da MKTBR IA, plataforma de inteligência artificial para marketing digital.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      description="Conheça as regras, responsabilidades e condições para utilizar a MKTBR IA de forma segura, lícita e profissional."
      lastUpdated={legalInfo.lastUpdated}
      sections={termsSections}
    />
  );
}