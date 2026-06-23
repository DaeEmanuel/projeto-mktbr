export type ButtonShape = "circle" | "rounded" | "square";
export type ButtonImageFit = "cover" | "contain";
export type ButtonGloss = "none" | "light" | "medium" | "strong" | "premium" | "glass" | "metallic";
export type ButtonQrType = "link" | "whatsapp" | "pix" | "text";
export type PixKeyType = "cpf" | "cnpj" | "celular" | "email" | "aleatoria";
export type ButtonBackgroundType = "solid" | "gradient" | "image";
export type ButtonCategory =
  | "Escola"
  | "Empresa"
  | "Igrejas"
  | "Evento"
  | "Marketing Digital"
  | "Casamento"
  | "Aniversários"
  | "Pet";

export type ButtonConfig = {
  title: string;
  subtitle: string;
  slogan: string;
  category: ButtonCategory;
  shape: ButtonShape;
  sizeMm: number;
  backgroundType: ButtonBackgroundType;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  backgroundImageDataUrl: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  showQrCode: boolean;
  qrCodeText: string;
  layout: "central" | "badge" | "ribbon";
  mainImageDataUrl: string;
  imageFit: ButtonImageFit;
  imageX: number;
  imageY: number;
  imageScale: number;
  imageRotation: number;
  gloss: ButtonGloss;
  qrType: ButtonQrType;
  qrX: number;
  qrY: number;
  qrSize: number;
  whatsappNumber: string;
  whatsappMessage: string;
  freeText: string;
  pixKeyType: PixKeyType;
  pixKey: string;
  pixReceiverName: string;
  pixCity: string;
  pixBankName: string;
  pixAmount: string;
  pixTransactionId: string;
  pixDescription: string;
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
  "Escola",
  "Empresa",
  "Igrejas",
  "Evento",
  "Marketing Digital",
  "Casamento",
  "Aniversários",
  "Pet",
];

export const defaultButtonConfig: ButtonConfig = {
  title: "MKTBR",
  subtitle: "Produtos digitais",
  slogan: "Aprenda. Publique. Venda.",
  category: "Marketing Digital",
  shape: "circle",
  sizeMm: 58,
  backgroundType: "solid",
  backgroundColor: "#00C853",
  gradientFrom: "#00C853",
  gradientTo: "#061421",
  backgroundImageDataUrl: "",
  textColor: "#061421",
  accentColor: "#ffffff",
  fontFamily: "Inter, Arial, sans-serif",
  showQrCode: true,
  qrCodeText: "https://mktbr.site",
  layout: "central",
  mainImageDataUrl: "",
  imageFit: "cover",
  imageX: 0,
  imageY: 0,
  imageScale: 100,
  imageRotation: 0,
  gloss: "medium",
  qrType: "link",
  qrX: 72,
  qrY: 72,
  qrSize: 62,
  whatsappNumber: "",
  whatsappMessage: "Olá! Vim pelo botton da MKTBR.",
  freeText: "MKTBR",
  pixKeyType: "email",
  pixKey: "",
  pixReceiverName: "",
  pixCity: "",
  pixBankName: "",
  pixAmount: "",
  pixTransactionId: "MKTBR",
  pixDescription: "",
};

export const buttonTemplates: Array<{
  name: string;
  category: ButtonCategory;
  author: string;
  price: string;
  premium?: boolean;
  config: ButtonConfig;
}> = [
  {
    name: "Volta as Aulas",
    category: "Escola",
    author: "MKTBR Studio",
    price: "Grátis",
    config: { ...defaultButtonConfig, title: "Minha Turma", subtitle: "2026", slogan: "Aprender transforma", category: "Escola", backgroundColor: "#2563eb", textColor: "#ffffff", accentColor: "#facc15", layout: "badge" },
  },
  {
    name: "Marca Corporativa",
    category: "Empresa",
    author: "MKTBR Empresas",
    price: "R$ 9,90",
    premium: true,
    config: { ...defaultButtonConfig, title: "Equipe Pro", subtitle: "Atendimento", slogan: "Excelência em cada detalhe", category: "Empresa", backgroundColor: "#0f172a", textColor: "#ffffff", accentColor: "#38bdf8", layout: "central" },
  },
  {
    name: "Encontro da Igreja",
    category: "Igrejas",
    author: "Comunidade Criativa",
    price: "Grátis",
    config: { ...defaultButtonConfig, title: "Encontro Jovem", subtitle: "Comunidade", slogan: "Fé que aproxima", category: "Igrejas", backgroundColor: "#7c3aed", textColor: "#ffffff", accentColor: "#fef3c7", layout: "ribbon" },
  },
  {
    name: "Credencial Evento",
    category: "Evento",
    author: "Eventos BR",
    price: "R$ 7,90",
    config: { ...defaultButtonConfig, title: "Evento VIP", subtitle: "Acesso oficial", slogan: "Conecte-se ao novo", category: "Evento", backgroundColor: "#111827", textColor: "#ffffff", accentColor: "#00C853", layout: "badge" },
  },
  {
    name: "Lançamento Digital",
    category: "Marketing Digital",
    author: "MKTBR Growth",
    price: "R$ 14,90",
    premium: true,
    config: { ...defaultButtonConfig, title: "Oferta Online", subtitle: "Acesse pelo QR", slogan: "Venda todos os dias", category: "Marketing Digital", backgroundColor: "#00C853", textColor: "#061421", accentColor: "#ffffff", layout: "ribbon" },
  },
  {
    name: "Casamento",
    category: "Casamento",
    author: "Ateliê Digital",
    price: "R$ 12,90",
    premium: true,
    config: { ...defaultButtonConfig, title: "Ana & Leo", subtitle: "18.09.2026", slogan: "Celebre esse amor", category: "Casamento", backgroundColor: "#f8fafc", textColor: "#334155", accentColor: "#d946ef", layout: "central" },
  },
  {
    name: "Aniversário",
    category: "Aniversários",
    author: "Festa Fácil",
    price: "Grátis",
    config: { ...defaultButtonConfig, title: "Parabéns!", subtitle: "Festa especial", slogan: "Hoje é dia de brilhar", category: "Aniversários", backgroundColor: "#f97316", textColor: "#ffffff", accentColor: "#fde68a", layout: "ribbon" },
  },
  {
    name: "Pet Shop",
    category: "Pet",
    author: "Pet Criativo",
    price: "R$ 6,90",
    config: { ...defaultButtonConfig, title: "Meu Pet", subtitle: "Clube de cuidados", slogan: "Carinho que aparece", category: "Pet", backgroundColor: "#fb7185", textColor: "#ffffff", accentColor: "#fef9c3", layout: "badge" },
  },
];

export function mergeButtonConfig(config?: Partial<ButtonConfig> | null): ButtonConfig {
  const rawCategory = config?.category as string | undefined;
  const categoryAliases: Record<string, ButtonCategory> = {
    Escolar: "Escola",
    Empresas: "Empresa",
    Eventos: "Evento",
    Casamentos: "Casamento",
    Pets: "Pet",
    Igreja: "Igrejas",
  };
  const normalizedCategory = rawCategory ? categoryAliases[rawCategory] || config?.category : config?.category;
  return { ...defaultButtonConfig, ...(config || {}), category: normalizedCategory || defaultButtonConfig.category };
}