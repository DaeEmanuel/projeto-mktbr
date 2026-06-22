const contactEmail = "bairropay@gmail.com";

export const legalInfo = {
  platform: "MKTBR IA",
  responsible: "Emanuel Carvalho | MD Carvalho",
  email: contactEmail,
  site: "https://mktbr.site",
  lastUpdated: "22 de junho de 2026",
};

export const privacySections = [
  {
    title: "1. Identificação da plataforma",
    content: (
      <p>
        A {legalInfo.platform} é uma plataforma digital voltada ao uso de inteligência artificial
        aplicada ao marketing digital, criação de conteúdo, automação, análise e apoio a
        estratégias comerciais. O responsável e desenvolvedor da plataforma é{" "}
        <strong>{legalInfo.responsible}</strong>. O site oficial é{" "}
        <a className="font-bold text-[#128C3E]" href={legalInfo.site}>
          {legalInfo.site}
        </a>
        .
      </p>
    ),
  },
  {
    title: "2. Dados coletados",
    content: (
      <p>
        Podemos coletar dados fornecidos pelo usuário, como nome, e-mail, informações de cadastro,
        preferências de uso, mensagens enviadas a formulários, histórico de interações com
        ferramentas de IA e informações necessárias para suporte, autenticação e operação da
        plataforma.
      </p>
    ),
  },
  {
    title: "3. Uso das informações",
    content: (
      <p>
        As informações são utilizadas para criar e gerenciar contas, entregar funcionalidades,
        processar solicitações, melhorar a experiência, personalizar recursos, gerar conteúdos com
        inteligência artificial, prestar suporte, prevenir fraudes e cumprir obrigações legais ou
        regulatórias aplicáveis.
      </p>
    ),
  },
  {
    title: "4. Cookies e tecnologias semelhantes",
    content: (
      <p>
        A plataforma pode utilizar cookies, pixels e tecnologias semelhantes para manter sessões,
        entender o uso do site, melhorar desempenho, lembrar preferências e apoiar análises de
        marketing. O usuário pode gerenciar cookies nas configurações do navegador, observando que
        certas funcionalidades podem ser afetadas.
      </p>
    ),
  },
  {
    title: "5. Compartilhamento de dados",
    content: (
      <p>
        Dados podem ser compartilhados com provedores essenciais para hospedagem, autenticação,
        pagamentos, segurança, analytics, atendimento e processamento de recursos de IA, sempre com
        finalidade operacional e em conformidade com esta política. A MKTBR IA não vende dados
        pessoais dos usuários.
      </p>
    ),
  },
  {
    title: "6. Segurança",
    content: (
      <p>
        Adotamos medidas técnicas e organizacionais razoáveis para proteger informações contra
        acesso não autorizado, perda, alteração, divulgação indevida ou uso abusivo. Nenhuma
        transmissão digital é absolutamente imune a riscos, mas buscamos aplicar boas práticas de
        segurança e controle.
      </p>
    ),
  },
  {
    title: "7. Direitos do usuário",
    content: (
      <p>
        O usuário pode solicitar acesso, correção, atualização, portabilidade, revisão, exclusão ou
        limitação do uso de seus dados, quando aplicável. Solicitações relacionadas a privacidade
        devem ser enviadas para{" "}
        <a className="font-bold text-[#128C3E]" href={`mailto:${legalInfo.email}`}>
          {legalInfo.email}
        </a>
        .
      </p>
    ),
  },
  {
    title: "8. Retenção de dados",
    content: (
      <p>
        Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta
        política, atender obrigações legais, resolver disputas, preservar segurança, manter registros
        operacionais e oferecer suporte ao usuário.
      </p>
    ),
  },
  {
    title: "9. Alterações nesta política",
    content: (
      <p>
        Esta Política de Privacidade pode ser atualizada periodicamente para refletir melhorias,
        alterações legais, novas funcionalidades ou ajustes operacionais. A data de última
        atualização será sempre exibida nesta página.
      </p>
    ),
  },
  {
    title: "10. Contato",
    content: (
      <p>
        Para dúvidas, solicitações de suporte ou assuntos relacionados a privacidade, entre em
        contato pelo e-mail{" "}
        <a className="font-bold text-[#128C3E]" href={`mailto:${legalInfo.email}`}>
          {legalInfo.email}
        </a>
        .
      </p>
    ),
  },
];

export const termsSections = [
  {
    title: "1. Aceitação dos termos",
    content: (
      <p>
        Ao acessar ou utilizar a {legalInfo.platform}, o usuário declara que leu, compreendeu e
        concorda com estes Termos de Uso. Caso não concorde com qualquer condição, deverá interromper
        o uso da plataforma.
      </p>
    ),
  },
  {
    title: "2. Uso permitido",
    content: (
      <p>
        A plataforma deve ser utilizada de forma lícita, ética e compatível com suas finalidades:
        apoio a marketing digital, criação de conteúdo, automação, análise, educação e gestão de
        ativos digitais. É proibido usar a MKTBR IA para fraudes, spam, violação de direitos,
        disseminação de conteúdo ilegal ou qualquer prática abusiva.
      </p>
    ),
  },
  {
    title: "3. Responsabilidade do usuário",
    content: (
      <p>
        O usuário é responsável pelas informações que fornece, pelos comandos enviados às ferramentas
        de IA, pelos conteúdos gerados, publicados ou compartilhados, bem como pela revisão humana
        antes de qualquer uso comercial, jurídico, financeiro, publicitário ou institucional.
      </p>
    ),
  },
  {
    title: "4. Inteligência artificial e resultados gerados",
    content: (
      <p>
        Os recursos de IA auxiliam na criação de ideias, textos, roteiros, campanhas, análises e
        materiais de marketing. Os resultados podem conter imprecisões, sugestões incompletas ou
        conteúdos que dependem de revisão. A decisão de utilizar qualquer resultado é sempre do
        usuário.
      </p>
    ),
  },
  {
    title: "5. Propriedade intelectual",
    content: (
      <p>
        Marcas, interfaces, textos institucionais, identidade visual, sistemas, códigos, organização
        da plataforma e materiais proprietários pertencem à MKTBR IA, Emanuel Carvalho, MD Carvalho
        ou seus licenciantes. O usuário não pode copiar, revender, sublicenciar ou explorar a
        plataforma sem autorização.
      </p>
    ),
  },
  {
    title: "6. Pagamentos, assinaturas e recursos pagos",
    content: (
      <p>
        Funcionalidades pagas, quando disponíveis, podem depender de provedores externos de pagamento
        e de condições comerciais específicas. O acesso a determinados recursos pode ser limitado,
        suspenso ou encerrado conforme o plano contratado, inadimplência, abuso ou violação destes
        termos.
      </p>
    ),
  },
  {
    title: "7. Limitação de responsabilidade",
    content: (
      <p>
        A MKTBR IA busca manter a plataforma disponível, segura e funcional, mas não garante ausência
        absoluta de falhas, interrupções, erros de terceiros ou indisponibilidades. Na extensão
        permitida pela lei, não nos responsabilizamos por perdas indiretas, lucros cessantes,
        decisões tomadas com base em conteúdos gerados por IA ou uso inadequado da plataforma.
      </p>
    ),
  },
  {
    title: "8. Suspensão ou encerramento de acesso",
    content: (
      <p>
        O acesso do usuário pode ser suspenso ou encerrado em caso de violação destes termos, uso
        abusivo, risco à segurança, tentativa de fraude, descumprimento legal, inadimplência ou
        comportamento que prejudique a plataforma, terceiros ou outros usuários.
      </p>
    ),
  },
  {
    title: "9. Alterações nos termos",
    content: (
      <p>
        Estes Termos de Uso podem ser alterados periodicamente para refletir mudanças legais,
        operacionais, comerciais ou novas funcionalidades. A continuidade de uso após a atualização
        indica concordância com a versão vigente.
      </p>
    ),
  },
  {
    title: "10. Contato",
    content: (
      <p>
        Para dúvidas, suporte ou comunicações sobre estes termos, entre em contato pelo e-mail{" "}
        <a className="font-bold text-[#128C3E]" href={`mailto:${legalInfo.email}`}>
          {legalInfo.email}
        </a>
        . Responsável/Desenvolvedor: <strong>{legalInfo.responsible}</strong>.
      </p>
    ),
  },
];