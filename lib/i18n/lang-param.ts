// Bahasa dari link: welcomemanado.com dan manado.tours menautkan ke situs ini
// dengan `?lang=<kode>` supaya pengunjung langsung mendarat di bahasanya.
import { locales, type Locale } from "./dictionaries";

/** Kode bahasa dari `?lang=` bila persis salah satu bahasa situs; selain itu null. */
export function langFromSearch(search: string): Locale | null {
  const lang = new URLSearchParams(search).get("lang");
  return lang && (locales as readonly string[]).includes(lang) ? (lang as Locale) : null;
}

/** URL yang sama tanpa parameter `lang` (parameter lain dan hash dipertahankan). */
export function urlWithoutLang(href: string): string {
  const url = new URL(href);
  url.searchParams.delete("lang");
  return url.toString();
}
