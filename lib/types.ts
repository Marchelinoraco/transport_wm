export type Car = {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: "tersedia" | "disewa";
  /** Harga Full day (maks. 12 jam, dengan sopir). 0 = belum ada harga. */
  price_rent: number;
  /** Transfer sekali jalan dengan sopir (kolom API `price_pickup`). */
  price_transfer: number | null;
  /** Over time per jam setelah 12 jam, paket dengan sopir. */
  price_overtime: number | null;
  /** Lepas kunci per hari; null = unit tidak disewakan lepas kunci. */
  price_self_drive: number | null;
  /** Isi silinder; menentukan golongan Biaya Area (≤ 2000 cc / > 2000 cc). */
  engine_cc: number | null;
  price_unit: "per_day" | "per_trip";
  year: number | null;
  seats: number | null;
  transmission: string | null;
  fuel: string | null;
  badge: "POPULER" | "BARU" | "PROMO" | null;
  dengan_sopir: boolean;
  description: string | null;
  description_en: string | null;
  description_ko: string | null;
  description_zh: string | null;
  images: string[];
  created_at?: string;
};
