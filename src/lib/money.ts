export const PLATFORM_COMMISSION_CENTS = 500;

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function calculateWriterNet(amountCents: number) {
  return Math.max(amountCents - PLATFORM_COMMISSION_CENTS, 0);
}
