// Bahan bersama landing page SEO (/sewa-hiace-manado, /sewa-alphard-manado,
// /rental-mobil-manado). Semua angka dibaca dari data armada (admin) supaya
// halaman tidak bisa menyebut harga yang berbeda dengan kartu & form booking.
import type { Car } from "./types";
import { hargaPaket, hargaUtama } from "./paket";
import { AREA_SEWA, TARIF_PELAYANAN, rp } from "./tarif-sewa";

/** Urut harga naik; harga sama diurut nama, supaya urutan tidak ikut urutan API. */
function urutHarga(harga: (c: Car) => number | null) {
  const h = (c: Car) => harga(c) ?? Number.POSITIVE_INFINITY;
  return (a: Car, b: Car) => h(a) - h(b) || a.name.localeCompare(b.name);
}

/** Unit yang namanya cocok dengan pola, termurah di depan. */
export function unitCocok(cars: Car[], pola: RegExp): Car[] {
  return cars.filter((c) => pola.test(c.name)).sort(urutHarga((c) => hargaUtama(c)?.harga ?? null));
}

/** "A", "A dan B", "A, B, dan C". */
export function daftarNama(nama: string[]): string {
  if (nama.length <= 1) return nama[0] ?? "";
  if (nama.length === 2) return `${nama[0]} dan ${nama[1]}`;
  return `${nama.slice(0, -1).join(", ")}, dan ${nama[nama.length - 1]}`;
}

/** Harga ringkas untuk judul: "Rp 350 Ribu", "Rp 1,5 Juta". */
export function rpSingkat(nilai: number): string {
  const angka = (n: number) => String(Number(n.toFixed(2))).replace(".", ",");
  return nilai >= 1_000_000 ? `Rp ${angka(nilai / 1_000_000)} Juta` : `Rp ${angka(nilai / 1_000)} Ribu`;
}

const lepasKunci = (c: Car) => hargaPaket(c, "self_drive");

/** Unit yang disewakan lepas kunci, termurah di depan. */
export function unitLepasKunci(cars: Car[]): Car[] {
  return cars.filter((c) => lepasKunci(c) !== null).sort(urutHarga(lepasKunci));
}

/** Isi paket untuk unit yang hanya disewakan dengan sopir (Hiace, Alphard). */
export function paragrafPaketDenganSopir(unit: string): string {
  return `Paket **Full day** berlaku sampai 12 jam per hari dan sudah termasuk sopir beserta uang makannya, BBM sampai ${TARIF_PELAYANAN.batasKmPerHari} km per hari, serta parkir sampai ${rp(TARIF_PELAYANAN.batasParkirPerHari)} per hari. Lewat dari 12 jam dikenakan over time per jam. Paket **Transfer** adalah sekali jalan dengan sopir — paling pas untuk menjemput atau mengantar di Bandara Sam Ratulangi. Tol dan tiket masuk tempat wisata belum termasuk. ${unit} hanya disewakan dengan sopir, tidak lepas kunci.`;
}

/** Biaya Area di luar Kota Manado — angkanya ada di halaman unit & form booking. */
export function paragrafBiayaArea(): string {
  return `Untuk tujuan di luar Kota Manado berlaku **Biaya Area** per hari, misalnya ke ${AREA_SEWA[1].wilayah}. Besarnya tercantum di halaman tiap unit dan dihitung otomatis di form booking, jadi total yang Anda lihat sama dengan yang ditagihkan. Ketentuan lengkapnya ada di [Syarat & Ketentuan](/syarat-ketentuan).`;
}

/** Lepas kunci termurah di antara unit yang tersedia; null bila tidak ada. */
export function hargaLepasKunciMulai(cars: Car[]): number | null {
  const harga = cars
    .filter((c) => c.status === "tersedia")
    .map(lepasKunci)
    .filter((n): n is number => n !== null);
  return harga.length ? Math.min(...harga) : null;
}
