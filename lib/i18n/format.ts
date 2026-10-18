import type { Locale } from "./dictionaries";

/** Isi placeholder `{nama}` di teks kamus. Placeholder yang tidak dikenal dibiarkan apa adanya. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (asli, kunci: string) => (kunci in vars ? String(vars[kunci]) : asli));
}

const INTL: Record<Locale, string> = { id: "id-ID", en: "en-US", zh: "zh-CN", ko: "ko-KR" };

/** "2026-10-01" → "1 Oktober 2026" (per bahasa). Dihitung di UTC supaya tanggal tidak bergeser. */
export function formatTanggal(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
