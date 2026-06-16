import { PLATFORM_COMMISSION_CENTS } from "@/lib/money";

const allowedSynopsisTags = new Set(["strong", "b", "em", "i", "ul", "ol", "li", "br", "p"]);

export function normalizeBookSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function suggestBookSlug(title: string) {
  return normalizeBookSlug(title).slice(0, 48) || "meu-ebook";
}

export function parsePriceToCents(value: FormDataEntryValue | string | number | null) {
  const normalized = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  return Math.round(Number(normalized || 0) * 100);
}

export function sanitizeSynopsisHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tag: string) => {
      const normalizedTag = tag.toLowerCase();
      if (!allowedSynopsisTags.has(normalizedTag)) {
        return "";
      }

      if (match.startsWith("</")) {
        return normalizedTag === "br" ? "" : `</${normalizedTag}>`;
      }

      return normalizedTag === "br" ? "<br>" : `<${normalizedTag}>`;
    })
    .replace(/\n/g, "<br>")
    .trim();
}

export function validateBookPrice(priceCents: number) {
  return priceCents > PLATFORM_COMMISSION_CENTS;
}
