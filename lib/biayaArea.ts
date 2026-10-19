import type { Car } from "./types";
import type { Paket } from "./paket";
import { type PilihanArea, hitungBooking } from "./hitungBooking";

export type StatusArea = "gratis" | "termasuk" | "harga" | "dikonfirmasi";
export type BarisArea = { area: PilihanArea; status: StatusArea; nominal: number | null; perHari: boolean };

/**
 * Tabel biaya area untuk satu mobil dan satu paket. Sengaja dibangun dari
 * hitungBooking (jumlah 1) supaya tabel di halaman dan total di kotak booking
 * tidak mungkin menyebut angka berbeda.
 */
export function tabelBiayaArea(car: Car, paket: Paket): BarisArea[] | null {
  const daftar: PilihanArea[] = paket === "self_drive" ? ["pool", 1, 2, 3, 4] : [1, 2, 3, 4];
  const perHari = paket === "full_day";
  const baris: BarisArea[] = [];
  for (const area of daftar) {
    const h = hitungBooking({ car, paket, jumlah: 1, area });
    if (!h) return null;
    if (h.dikonfirmasi) baris.push({ area, status: "dikonfirmasi", nominal: null, perHari });
    else if (paket === "transfer") baris.push({ area, status: "termasuk", nominal: 0, perHari });
    else if (h.biayaTambahan === 0) baris.push({ area, status: "gratis", nominal: 0, perHari });
    else baris.push({ area, status: "harga", nominal: h.biayaTambahan, perHari });
  }
  return baris;
}
