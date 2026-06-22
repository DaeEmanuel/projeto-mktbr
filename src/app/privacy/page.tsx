import { LegalPage } from "@/components/legal-page";
import { legalInfo, privacySections } from "@/lib/legal";

export const metadata = {
  title: "Política de Privacidade | MKTBR IA",
  description:
    "Política de Privacidade da MKTBR IA, plataforma de inteligência artificial para marketing digital.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      description="Saiba como a MKTBR IA coleta, utiliza, protege e compartilha informações para oferecer uma experiência segura e profissional."
      lastUpdated={legalInfo.lastUpdated}
      sections={privacySections}
    />
  );
}