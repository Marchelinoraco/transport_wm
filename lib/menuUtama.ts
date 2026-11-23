import type { Dictionary } from "./i18n/dictionaries";

export type TautanMenu = { href: string; label: string };

/**
 * Daftar menu utama (notch desktop dan panel HP memakai satu sumber ini).
 * Notch sempit → label S&K dipendekkan ("Syarat"); panel HP lega → label lengkap.
 */
export function menuUtama(dict: Dictionary, varian: "notch" | "panel"): TautanMenu[] {
  return [
    { href: "/", label: dict.nav.home },
    { href: "/katalog", label: dict.nav.catalog },
    { href: "/promo", label: dict.nav.promo },
    { href: "/blog", label: dict.nav.blog },
    { href: "/tentang", label: dict.nav.about },
    { href: "/syarat-ketentuan", label: varian === "notch" ? dict.nav.termsShort : dict.nav.terms },
  ];
}
