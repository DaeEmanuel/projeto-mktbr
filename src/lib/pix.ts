import type { PixKeyType } from "./bottons";

export type PixPayloadInput = {
  keyType: PixKeyType;
  key: string;
  receiverName: string;
  amount?: string;
  transactionId?: string;
  description?: string;
};

export type PixPayloadResult =
  | { ok: true; payload: string; normalizedKey: string; receiverName: string; city: "BRASIL"; transactionId: string }
  | { ok: false; error: string };

function emv(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function crc16Ccitt(payload: string) {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function removeAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizePixText(value: string, max: number) {
  return removeAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9 .@+\-_]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeTransactionId(value?: string) {
  const txid = removeAccents(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 25);
  return txid || "***";
}

function normalizeAmount(value?: string) {
  const normalized = (value || "").trim().replace(",", ".");
  if (!normalized) return "";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return parsed.toFixed(2);
}

function normalizePixKey(type: PixKeyType, key: string) {
  const trimmed = key.trim();
  if (!trimmed) return "";

  if (type === "cpf" || type === "cnpj") {
    return trimmed.replace(/\D/g, "");
  }

  if (type === "celular") {
    let digits = trimmed.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length === 12) digits = digits.slice(1);
    if (digits.length === 11) return `+55${digits}`;
    if (digits.startsWith("55") && digits.length === 13) return `+${digits}`;
    return trimmed.startsWith("+") ? `+${digits}` : digits;
  }

  if (type === "email") {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

function validatePixKey(type: PixKeyType, key: string) {
  if (!key) return "Informe a chave Pix.";
  if (type === "cpf" && !/^\d{11}$/.test(key)) return "CPF Pix deve ter 11 digitos.";
  if (type === "cnpj" && !/^\d{14}$/.test(key)) return "CNPJ Pix deve ter 14 digitos.";
  if (type === "celular" && !/^\+55\d{10,11}$/.test(key)) return "Celular Pix deve estar no formato +55DDDNUMERO.";
  if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "E-mail Pix invalido.";
  return "";
}

export function buildPixPayload(input: PixPayloadInput): PixPayloadResult {
  const normalizedKey = normalizePixKey(input.keyType, input.key);
  const keyError = validatePixKey(input.keyType, normalizedKey);
  if (keyError) return { ok: false, error: keyError };

  const receiverName = normalizePixText(input.receiverName, 25);
  if (!receiverName) return { ok: false, error: "Informe o nome completo do recebedor." };

  const city = "BRASIL";
  const transactionId = normalizeTransactionId(input.transactionId);
  const amount = normalizeAmount(input.amount);
  const description = normalizePixText(input.description || "", 72);

  const merchantAccount =
    emv("00", "br.gov.bcb.pix") +
    emv("01", normalizedKey) +
    (description ? emv("02", description) : "");

  const payloadWithoutCrc =
    emv("00", "01") +
    emv("26", merchantAccount) +
    emv("52", "0000") +
    emv("53", "986") +
    (amount ? emv("54", amount) : "") +
    emv("58", "BR") +
    emv("59", receiverName) +
    emv("60", city) +
    emv("62", emv("05", transactionId)) +
    "6304";

  return {
    ok: true,
    payload: `${payloadWithoutCrc}${crc16Ccitt(payloadWithoutCrc)}`,
    normalizedKey,
    receiverName,
    city,
    transactionId,
  };
}
