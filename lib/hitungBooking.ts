import type { Car } from "./types";
import { type Paket, golonganMesin, hargaPaket } from "./paket";
import { TARIF_LEPAS_KUNCI, TARIF_PELAYANAN } from "./tarif-sewa";

export type Area = 1 | 2 | 3 | 4;
/** "pool" hanya bermakna untuk lepas kunci: kendaraan diambil & dikembalikan di pool. */
export type PilihanArea = Area | "pool";

export type InputBooking = { car: Car; paket: Paket; jumlah: number; area: PilihanArea };

export type HasilBooking = {
  /** Harga paket per hari (full_day/self_drive) atau per trip (transfer). */
  tarif: number;
  /** Jumlah hari/trip setelah dinormalisasi. */
  jumlah: number;
  sewa: number;
  /** Biaya Area (per hari, full_day) atau antar-jemput (sekali, self_drive). */
  jenisTambahan: "area" | "antar" | null;
  tarifTambahan: number;
  biayaTambahan: number;
  /** Ada biaya yang belum bisa dihitung: Area 4, cc kosong, atau transfer ke luar Area 1. */
  dikonfirmasi: boolean;
  total: number;
};

export function normalisasiJumlah(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(365, Math.max(1, Math.floor(n)));
}

export function hitungBooking({ car, paket, jumlah, area }: InputBooking): HasilBooking | null {
  const tarif = hargaPaket(car, paket);
  if (tarif === null) return null;

  const n = normalisasiJumlah(jumlah);
  const sewa = tarif * n;
  const tanpaTambahan = (dikonfirmasi: boolean, jenis: HasilBooking["jenisTambahan"] = null): HasilBooking => ({
    tarif, jumlah: n, sewa, jenisTambahan: jenis, tarifTambahan: 0, biayaTambahan: 0, dikonfirmasi, total: sewa,
  });

  if (paket === "transfer") return tanpaTambahan(area !== 1 && area !== "pool");

  if (paket === "self_drive") {
    if (area === "pool") return tanpaTambahan(false);
    if (area === 4) return tanpaTambahan(true, "antar");
    const antar = TARIF_LEPAS_KUNCI.antarJemput[area];
    return { tarif, jumlah: n, sewa, jenisTambahan: "antar", tarifTambahan: antar, biayaTambahan: antar, dikonfirmasi: false, total: sewa + antar };
  }

  const a = area === "pool" ? 1 : area;
  if (a === 1) return tanpaTambahan(false);
  if (a === 4) return tanpaTambahan(true, "area");
  const golongan = golonganMesin(car.engine_cc);
  if (golongan === null) return tanpaTambahan(true, "area");
  const perHari = TARIF_PELAYANAN.area[a][golongan];
  return { tarif, jumlah: n, sewa, jenisTambahan: "area", tarifTambahan: perHari, biayaTambahan: perHari * n, dikonfirmasi: false, total: sewa + perHari * n };
}

/** Area yang sah setelah paket diganti: "pool" hanya untuk lepas kunci; pindah ke lepas kunci selalu ke pool. */
export function areaUntukPaket(area: PilihanArea, paket: Paket): PilihanArea {
  if (paket === "self_drive") return "pool";
  return area === "pool" ? 1 : area;
}
