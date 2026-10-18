import type { Car } from "./types";
import { AMBANG_MESIN_CC } from "./tarif-sewa";

export type Paket = "full_day" | "transfer" | "self_drive";
export const PAKET: readonly Paket[] = ["full_day", "transfer", "self_drive"];

/** Harga 0 atau kosong berarti "belum ada harga" — tampil "Tanya harga", tidak pernah "Rp 0". */
export function adaHarga(n: number | null | undefined): n is number {
  return typeof n === "number" && n > 0;
}

export function hargaPaket(car: Car, paket: Paket): number | null {
  const n =
    paket === "full_day" ? car.price_rent : paket === "transfer" ? car.price_transfer : car.price_self_drive;
  return adaHarga(n) ? n : null;
}

export function paketTersedia(car: Car): Paket[] {
  return PAKET.filter((p) => hargaPaket(car, p) !== null);
}

export type Golongan = "kecil" | "besar";

export function golonganMesin(cc: number | null): Golongan | null {
  if (!adaHarga(cc)) return null;
  return cc <= AMBANG_MESIN_CC ? "kecil" : "besar";
}

/** Full day termurah di antara unit yang tersedia dan berharga; null bila tidak ada. */
export function hargaMulai(cars: Car[]): number | null {
  const harga = cars.filter((c) => c.status === "tersedia" && adaHarga(c.price_rent)).map((c) => c.price_rent);
  return harga.length ? Math.min(...harga) : null;
}
