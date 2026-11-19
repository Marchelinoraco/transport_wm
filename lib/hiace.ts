// Halaman /sewa-hiace-manado. Search Console 19 Nov 2026: "sewa hiace manado"
// 31 tayangan di posisi ±14,7 (halaman 2) tanpa halaman khusus — kata kunci
// paling dekat ke halaman 1. Harga selalu dibaca dari data armada (admin),
// tidak pernah ditulis di sini, supaya halaman ini tidak bisa basi.
import type { Car } from "./types";
import { hargaMulai } from "./paket";
import { rp } from "./tarif-sewa";
import { unitCocok } from "./landing";

/** Unit Hiace di armada (dikenali dari nama), termurah di depan. */
export function unitHiace(cars: Car[]): Car[] {
  return unitCocok(cars, /hiace/i);
}

/** Meta description: menyebut harga Full day termurah bila terbaca, tanpa angka bila tidak. */
export function deskripsiHiace(cars: Car[]): string {
  const mulai = hargaMulai(unitHiace(cars));
  return mulai !== null
    ? `Sewa Hiace di Manado dengan sopir untuk rombongan sampai 14 orang, mulai ${rp(mulai)}/hari (12 jam). Commuter & Premio, jemput bandara, Tomohon, Likupang.`
    : "Sewa Hiace di Manado dengan sopir untuk rombongan sampai 14 orang: Commuter & Premio, jemput bandara, wisata Tomohon & Likupang. Pesan via WhatsApp.";
}
