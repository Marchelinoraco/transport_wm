import type { Car } from "@/lib/types";

/** Mobil contoh untuk test: Avanza sesuai daftar harga 1 Okt 2026, bisa ditimpa per kolom. */
export function mobil(ubah: Partial<Car> = {}): Car {
  return {
    id: 5,
    name: "Toyota Avanza",
    slug: "toyota-avanza",
    type: "Mini MVP",
    status: "tersedia",
    price_rent: 700_000,
    price_unit: "per_day",
    price_transfer: 300_000,
    price_overtime: 50_000,
    price_self_drive: 400_000,
    engine_cc: 1500,
    year: null,
    seats: null,
    transmission: null,
    fuel: null,
    badge: null,
    dengan_sopir: false,
    description: null,
    description_en: null,
    description_ko: null,
    description_zh: null,
    images: ["/images/cars/toyota-avanza.png"],
    ...ubah,
  };
}
