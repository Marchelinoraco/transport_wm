/**
 * Garis tepi navbar "notch": satu jalur yang menelusuri seluruh bentuknya,
 * dan kilau simetris (putih di tengah, merah memudar ke kedua sisi) yang
 * berjalan di sepanjang jalur itu dari kiri ke kanan.
 */
export type UkuranNotch = { lebar: number; tinggi: number; r: number; rb: number };

/**
 * Atribut `d` SVG. Titik nol = ujung kiri lengkung cekung kiri di tepi atas
 * layar; lebar total = lebar + 2r. Urutan: lengkung cekung kiri → sisi kiri →
 * sudut kiri-bawah → bawah → sudut kanan-bawah → sisi kanan → lengkung cekung kanan.
 */
export function jalurNotch({ lebar: W, tinggi: H, r, rb }: UkuranNotch): string {
  return [
    `M 0 0 A ${r} ${r} 0 0 1 ${r} ${r}`,
    `L ${r} ${H - rb} A ${rb} ${rb} 0 0 0 ${r + rb} ${H}`,
    `L ${r + W - rb} ${H} A ${rb} ${rb} 0 0 0 ${r + W} ${H - rb}`,
    `L ${r + W} ${r} A ${r} ${r} 0 0 1 ${2 * r + W} 0`,
  ].join(" ");
}

/** [bagian panjang jalur, tebal, warna, opasitas, cahaya px] — semua lapisan berpusat di titik yang sama. */
export const LAPIS_KILAU: readonly [number, number, string, number, number][] = [
  [0.26, 1.1, "#ef4444", 0.16, 0],
  [0.17, 1.4, "#ef4444", 0.32, 0],
  [0.1, 1.8, "#f87171", 0.6, 3],
  [0.05, 2.2, "#fecaca", 0.9, 5],
  [0.022, 2.6, "#fff", 1, 7],
];

export const DURASI_KILAU = 4200;

/** Posisi pusat kilau di sepanjang jalur: linear dari -M sampai L + M, lalu berulang. */
export function pusatKilau(waktuMs: number, panjang: number, setengahTerpanjang: number, durasi = DURASI_KILAU): number {
  const fase = (((waktuMs % durasi) + durasi) % durasi) / durasi;
  return -setengahTerpanjang + (panjang + 2 * setengahTerpanjang) * fase;
}

/** strokeDashoffset yang menempatkan dash sepanjang `panjangLapis` tepat berpusat di `pusat`. */
export function offsetLapis(pusat: number, panjangLapis: number): number {
  return -(pusat - panjangLapis / 2);
}
