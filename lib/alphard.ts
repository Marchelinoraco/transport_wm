// Halaman /sewa-alphard-manado. Search Console 19 Nov 2026: "sewa alphard
// manado" posisi ±22 tanpa halaman khusus; nilai sewa per transaksi tertinggi.
import type { Car } from "./types";
import { hargaMulai } from "./paket";
import { rp } from "./tarif-sewa";
import { unitCocok } from "./landing";

/** Unit Alphard di armada (dikenali dari nama), yang lebih terjangkau di depan. */
export function unitAlphard(cars: Car[]): Car[] {
  return unitCocok(cars, /alphard/i);
}

/** Meta description: harga Full day termurah bila terbaca, tanpa angka bila tidak. */
export function deskripsiAlphard(cars: Car[]): string {
  const mulai = hargaMulai(unitAlphard(cars));
  return mulai !== null
    ? `Sewa Toyota Alphard di Manado dengan sopir untuk tamu VIP, pernikahan & jemput bandara, mulai ${rp(mulai)}/hari (12 jam). Pesan via WhatsApp.`
    : "Sewa Toyota Alphard di Manado dengan sopir untuk tamu VIP, pernikahan, perjalanan dinas & jemput bandara. Pesan cepat via WhatsApp.";
}
