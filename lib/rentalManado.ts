// Halaman /rental-mobil-manado — kata kunci utama, posisi ±28 (Search Console
// 19 Nov 2026). Judul, deskripsi, ringkasan harga, dan daftar unit lepas kunci
// disusun dari data armada; sebelumnya ditulis tangan dan sempat basi
// (Brio & Agya tidak disebut sebagai unit lepas kunci).
import type { Car } from "./types";
import { hargaMulai } from "./paket";
import { rp } from "./tarif-sewa";
import { daftarNama, hargaLepasKunciMulai, rpSingkat, unitLepasKunci } from "./landing";

function hargaTermurah(cars: Car[]) {
  return { lepasKunci: hargaLepasKunciMulai(cars), sopir: hargaMulai(cars) };
}

export function judulRental(cars: Car[]): string {
  const { lepasKunci, sopir } = hargaTermurah(cars);
  const termurah = [lepasKunci, sopir].filter((n): n is number => n !== null);
  return termurah.length
    ? `Rental Mobil Manado Murah — Mulai ${rpSingkat(Math.min(...termurah))}/Hari`
    : "Rental Mobil Manado Murah & Terpercaya";
}

export function deskripsiRental(cars: Car[]): string {
  const { lepasKunci, sopir } = hargaTermurah(cars);
  if (lepasKunci !== null && sopir !== null) {
    return `Rental mobil Manado mulai ${rp(lepasKunci)}/hari lepas kunci & ${rp(sopir)}/hari dengan sopir. City car, MPV, Hiace, Alphard & bus. Jemput Bandara Sam Ratulangi.`;
  }
  return "Rental mobil Manado murah & terpercaya. Full day dengan sopir, transfer bandara, atau lepas kunci — city car, MPV, Hiace, Alphard & bus. Pesan via WhatsApp.";
}

/** Paragraf "Berapa harga rental mobil di Manado?" (mendukung **tebal** & [link](/path)). */
export function paragrafHargaRental(cars: Car[]): string {
  const { lepasKunci, sopir } = hargaTermurah(cars);
  const rincian = "Rincian semua unit ada di [daftar harga sewa mobil Manado 2026](/blog/harga-sewa-mobil-manado-2026).";
  if (lepasKunci !== null && sopir !== null) {
    return `Sewa lepas kunci mulai **${rp(lepasKunci)} per hari**, dan Full day dengan sopir (maks. 12 jam) mulai **${rp(sopir)} per hari**. Harga tiap unit tercantum di kartu mobil dan dihitung otomatis di form booking, tanpa biaya tersembunyi. ${rincian}`;
  }
  return `Harga tiap unit tercantum di kartu mobil dan dihitung otomatis di form booking, tanpa biaya tersembunyi. ${rincian}`;
}

/** "Lepas kunci tersedia untuk …." — kosong bila tidak ada unit lepas kunci. */
export function kalimatLepasKunci(cars: Car[]): string {
  const nama = unitLepasKunci(cars).map((c) => c.name);
  return nama.length ? `Lepas kunci tersedia untuk ${daftarNama(nama)}.` : "";
}
