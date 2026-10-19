import type { Car } from "./types";
import { adaHarga } from "./paket";

/**
 * Hingga `maks` unit lain dengan harga Full day terdekat. Unit tanpa harga
 * tidak ikut. Bila mobil ini sendiri belum berharga, yang ditampilkan unit
 * termurah. Selisih sama: id lebih kecil lebih dulu.
 */
export function mobilSerupa(car: Car, semua: Car[], maks = 4): Car[] {
  const acuan = adaHarga(car.price_rent) ? car.price_rent : 0;
  return semua
    .filter((c) => c.id !== car.id && adaHarga(c.price_rent))
    .sort((a, b) => Math.abs(a.price_rent - acuan) - Math.abs(b.price_rent - acuan) || a.id - b.id)
    .slice(0, maks);
}
