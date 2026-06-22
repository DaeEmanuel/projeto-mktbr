export type ButtonShape = "circle" | "rounded" | "square";
export type ButtonCategory =
  | "Escolar"
  | "Igreja"
  | "Eventos"
  | "Empresas"
  | "Marketing Digital"
  | "Pets"
  | "Casamentos"
  | "Aniversários";

export type ButtonConfig = {
  title: string;
  subtitle: string;
  slogan: string;
  category: ButtonCategory;
  shape: ButtonShape;
  sizeMm: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  showQrCode: boolean;
  qrCodeText: string;
  layout: "central" | "badge" | "ribbon";
};

export type ButtonProject = {
  id: string;
  user_id: string;
  nome_projeto: string;
  configuracao_json: ButtonConfig;
  imagem_preview: string | null;
  download_count?: number | null;
  created_at: string;
};

export const buttonCategories: ButtonCategory[] = [
  "Escolar",
  "Igreja",
  "Eventos",
  "Empresas",
  "Marketing Digital",
  "Pets",
  "Casamentos",
  "Aniversários",
];

export const defaultButtonConfig: ButtonConfig = {
  title: "MKTBR",
  subtitle: "Produtos digitais",
  slogan: "Aprenda. Publique. Venda.",
  category: "Marketing Digital",
  shape: "circle",
  sizeMm: 58,
  backgroundColor: "#00C853",
  textColor: "#061421",
  accentColor: "#ffffff",
  fontFamily: "Inter, Arial, sans-serif",
  showQrCode: true,
  qrCodeText: "https://mktbr.site",
  layout: "central",
};

export const buttonTemplates: Array<{
  name: string;
  category: ButtonCategory;
  premium?: boolean;
  config: ButtonConfig;
}> = [
  {
    name: "Volta as Aulas",
    category: "Escolar",
    config: {
      ...defaultButtonConfig,
      title: "Minha Turma",
      subtitle: "2026",
      slogan: "Aprender transforma",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
      accentColor: "#facc15",
      layout: "badge",
    },
  },
  {
    name: "Encontro da Igreja",
    category: "Igreja",
    config: {
      ...defaultButtonConfig,
      title: "Encontro Jovem",
      subtitle: "Comunidade",
      slogan: "Fé que aproxima",
      backgroundColor: "#7c3aed",
      textColor: "#ffffff",
      accentColor: "#fef3c7",
      layout: "ribbon",
    },
  },
  {
    name: "Credencial Evento",
    category: "Eventos",
    config: {
      ...defaultButtonConfig,
      title: "Evento VIP",
      subtitle: "Acesso oficial",
      slogan: "Conecte-se ao novo",
      backgroundColor: "#111827",
      textColor: "#ffffff",
      accentColor: "#00C853",
      layout: "badge",
    },
  },
  {
    name: "Marca Corporativa",
    category: "Empresas",
    config: {
      ...defaultButtonConfig,
      title: "Equipe Pro",
      subtitle: "Atendimento",
      slogan: "Excelência em cada detalhe",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      accentColor: "#38bdf8",
      layout: "central",
    },
  },
  {
    name: "Lançamento Digital",
    category: "Marketing Digital",
    premium: true,
    config: {
      ...defaultButtonConfig,
      title: "Oferta Online",
      subtitle: "Acesse pelo QR",
      slogan: "Venda todos os dias",
      backgroundColor: "#00C853",
      textColor: "#061421",
      accentColor: "#ffffff",
      layout: "ribbon",
    },
  },
  {
    name: "Pet Shop",
    category: "Pets",
    config: {
      ...defaultButtonConfig,
      title: "Meu Pet",
      subtitle: "Clube de cuidados",
      slogan: "Carinho que aparece",
      backgroundColor: "#fb7185",
      textColor: "#ffffff",
      accentColor: "#fef9c3",
      layout: "badge",
    },
  },
  {
    name: "Casamento",
    category: "Casamentos",
    premium: true,
    config: {
      ...defaultButtonConfig,
      title: "Ana & Leo",
      subtitle: "18.09.2026",
      slogan: "Celebre esse amor",
      backgroundColor: "#f8fafc",
      textColor: "#334155",
      accentColor: "#d946ef",
      layout: "central",
    },
  },
  {
    name: "Aniversário",
    category: "Aniversários",
    config: {
      ...defaultButtonConfig,
      title: "Parabéns!",
      subtitle: "Festa especial",
      slogan: "Hoje é dia de brilhar",
      backgroundColor: "#f97316",
      textColor: "#ffffff",
      accentColor: "#fde68a",
      layout: "ribbon",
    },
  },
];

export function mergeButtonConfig(config?: Partial<ButtonConfig> | null): ButtonConfig {
  return { ...defaultButtonConfig, ...(config || {}) };
}