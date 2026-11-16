import type { Car } from "./types";
import { hargaUtama } from "./paket";

/**
 * Hingga `maks` unit lain dengan harga harian (hargaUtama: Full day, atau
 * Lepas kunci bila unit itu lepas kunci saja) terdekat. Unit tanpa harga
 * tidak ikut. Bila mobil ini sendiri belum berharga, yang ditampilkan unit
 * termurah. Selisih sama: id lebih kecil lebih dulu.
 */
export function mobilSerupa(car: Car, semua: Car[], maks = 4): Car[] {
  const acuan = hargaUtama(car)?.harga ?? 0;
  const harga = (c: Car) => hargaUtama(c)?.harga ?? 0;
  return semua
    .filter((c) => c.id !== car.id && hargaUtama(c) !== null)
    .sort((a, b) => Math.abs(harga(a) - acuan) - Math.abs(harga(b) - acuan) || a.id - b.id)
    .slice(0, maks);
}
