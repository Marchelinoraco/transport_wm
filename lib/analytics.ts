// Google Analytics 4 & Search Console. Env var di Vercel (opsional):
//   NEXT_PUBLIC_GA_ID               Measurement ID GA4 — tanpa ini dipakai
//                                   GA_ID_BAWAAN di build produksi
//   NEXT_PUBLIC_GSC_VERIFICATION    isi atribut content dari meta
//                                   google-site-verification (Search Console)
// NEXT_PUBLIC_* ditanam saat build: setelah mengubahnya, deploy ulang.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type Gtag = (...args: unknown[]) => void;

/** ID GA4 yang sah, atau null. Nilainya ditempel ke <script>, jadi formatnya dikunci. */
export function gaIdValid(raw: string | undefined): string | null {
  const id = (raw ?? "").trim();
  return /^G-[A-Z0-9]+$/.test(id) ? id : null;
}

/** Token verifikasi Search Console, atau undefined agar meta-nya tidak dipasang. */
export function verifikasiGoogle(raw: string | undefined): string | undefined {
  const token = (raw ?? "").trim();
  return /^[A-Za-z0-9_-]+$/.test(token) ? token : undefined;
}

/**
 * Properti GA4 "Welcome Manado Transport", stream transport.welcomemanado.com
 * (dibuat 19 Nov 2026). Bukan rahasia — ID ini memang tampil di setiap halaman.
 */
export const GA_ID_BAWAAN = "G-67TC24X338";

/**
 * NEXT_PUBLIC_GA_ID di Vercel menang (diisi kosong = Analytics mati). Tanpa
 * env var, ID bawaan hanya dipakai di build produksi supaya `next dev` tidak
 * mengotori laporan dengan kunjungan dari laptop.
 */
export function pilihGaId(env: string | undefined, nodeEnv: string | undefined): string | null {
  if (env !== undefined) return gaIdValid(env);
  return nodeEnv === "production" ? GA_ID_BAWAAN : null;
}

export const GA_ID = pilihGaId(process.env.NEXT_PUBLIC_GA_ID, process.env.NODE_ENV);
export const GSC_VERIFICATION = verifikasiGoogle(process.env.NEXT_PUBLIC_GSC_VERIFICATION);

export function apakahLinkWhatsapp(href: string | null | undefined): boolean {
  if (!href) return false;
  return /^(https?:\/\/(wa\.me|api\.whatsapp\.com)\/|whatsapp:\/\/)/i.test(href);
}

/**
 * Event `klik_whatsapp` = calon customer menekan tombol WhatsApp. Tandai event
 * ini sebagai "Key event" di GA4 agar terhitung sebagai konversi (dan bisa
 * diimpor ke Google Ads). Tanpa gtag (Analytics belum dipasang / diblokir
 * browser) fungsi ini diam — tombol WhatsApp tetap berjalan seperti biasa.
 */
export function catatKlikWhatsapp(
  halaman: string,
  gtag: Gtag | undefined = typeof window !== "undefined" ? window.gtag : undefined
): boolean {
  if (typeof gtag !== "function") return false;
  gtag("event", "klik_whatsapp", { halaman });
  return true;
}
