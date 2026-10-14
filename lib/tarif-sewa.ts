import type { Locale } from "./i18n/dictionaries";

/**
 * Angka operasional sewa, menurut paketnya — SATU-SATUNYA tempat angka ini ditulis.
 *
 * Sumber: Daftar Harga Sewa Kendaraan (berlaku 1 Oktober 2026) dan
 * pesonamanado-web src/data/tarif-sewa.ts. Halaman Syarat & Ketentuan,
 * ringkasan paket, dan perhitungan form booking menyusun kalimat/angkanya
 * dari sini, sehingga ketiganya tidak dapat menyebut tarif berbeda.
 *
 * Harga per unit (Full day, Transfer, Lepas kunci, Over time) TIDAK di sini:
 * itu dikelola di admin.
 */

/** Wilayah per area, sama untuk semua paket. Teks Indonesia; terjemahan di NAMA_AREA. */
export const AREA_SEWA = [
  { nomor: 1, wilayah: "Dalam Kota Manado" },
  { nomor: 2, wilayah: "Tondano (Minahasa), Kota Tomohon, Likupang, Bitung" },
  { nomor: 3, wilayah: "Minahasa Selatan, Minahasa Tenggara" },
] as const;

/** Area pertama di luar daftar; wilayah maupun biayanya dikonfirmasi lebih dulu. */
export const AREA_DIKONFIRMASI = 4;

/** Ambang golongan mesin untuk Biaya Area paket dengan sopir. */
export const AMBANG_MESIN_CC = 2000;

/** Paket dengan sopir (Full day / Transfer). */
export const TARIF_PELAYANAN = {
  batasKmPerHari: 120,
  /** Parkir ditanggung sampai nominal ini per hari sewa; tol tanggungan penyewa. */
  batasParkirPerHari: 50_000,
  /** Biaya Area per hari sewa (paket Full day), menurut golongan mesin. */
  area: {
    1: { kecil: 0, besar: 0 },
    2: { kecil: 150_000, besar: 250_000 },
    3: { kecil: 250_000, besar: 350_000 },
  },
} as const;

export const TARIF_LEPAS_KUNCI = {
  batasKmPerHari: 120,
  /** Antar-jemput sekali per pemesanan; nihil bila diambil & dikembalikan di pool. */
  antarJemput: { 1: 150_000, 2: 300_000, 3: 600_000 },
  /** Keterlambatan pengembalian, per jam, flat untuk semua unit. */
  keterlambatanPerJam: 100_000,
} as const;

/** Versi daftar harga sekaligus versi Syarat & Ketentuan. */
export const HARGA_BERLAKU_SEJAK = "2026-10-01";

export const NAMA_AREA: Record<Locale, Record<1 | 2 | 3, string>> = {
  id: { 1: AREA_SEWA[0].wilayah, 2: AREA_SEWA[1].wilayah, 3: AREA_SEWA[2].wilayah },
  en: { 1: "Manado city", 2: "Tondano (Minahasa), Tomohon, Likupang, Bitung", 3: "South Minahasa, Southeast Minahasa" },
  zh: { 1: "万鸦老市区", 2: "通达诺（米纳哈萨）、多摩红、利库邦、比通", 3: "南米纳哈萨、东南米纳哈萨" },
  ko: { 1: "마나도 시내", 2: "톤다노(미나하사), 토모혼, 리쿠팡, 비퉁", 3: "남미나하사, 남동미나하사" },
};

/**
 * Rupiah dalam gaya penulisan angka bahasa masing-masing: Inggris memisah
 * ribuan dengan koma, Indonesia/Mandarin/Korea dengan titik.
 */
export function rp(nilai: number, gaya: "titik" | "koma" = "titik"): string {
  const angka = nilai.toString().replace(/\B(?=(\d{3})+(?!\d))/g, gaya === "koma" ? "," : ".");
  return `Rp ${angka}`;
}
