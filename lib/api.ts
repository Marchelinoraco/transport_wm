// Lapisan data: mengambil armada dari API Welcome Manado (Laravel) — menggantikan akses MySQL langsung.
import { Car } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type ApiTransportation = {
  id: number;
  name: string;
  slug: string | null;
  type: string | null;
  price: number;
  price_unit: string | null;
  seats: number | null;
  transmission: string | null;
  fuel: string | null;
  year: number | null;
  badge: string | null;
  dengan_sopir: boolean | number | null;
  available: boolean | number;
  image_url: string | null;
  images: string[] | null;
  description: string | null;
  description_en: string | null;
  description_ko: string | null;
  description_zh: string | null;
  created_at?: string;
};

function toCar(t: ApiTransportation): Car {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug ?? String(t.id),
    type: t.type ?? "",
    status: t.available ? "tersedia" : "disewa",
    price_rent: t.price,
    price_unit: t.price_unit === "per_trip" ? "per_trip" : "per_day",
    year: t.year ?? null,
    seats: t.seats ?? null,
    transmission: t.transmission ?? null,
    fuel: t.fuel ?? null,
    badge:
      t.badge === "POPULER" || t.badge === "BARU" || t.badge === "PROMO"
        ? t.badge
        : null,
    dengan_sopir: Boolean(t.dengan_sopir),
    description: t.description ?? null,
    description_en: t.description_en ?? null,
    description_ko: t.description_ko ?? null,
    description_zh: t.description_zh ?? null,
    images: t.images?.length ? t.images : t.image_url ? [t.image_url] : [],
    created_at: t.created_at,
  };
}

export async function getCars(): Promise<Car[]> {
  const res = await fetch(`${API_BASE}/transportations?per_page=100`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  const items: ApiTransportation[] = json?.data?.data ?? [];
  return items.map(toCar);
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const res = await fetch(
    `${API_BASE}/transportations/slug/${encodeURIComponent(slug)}`,
    { next: { revalidate: 60 } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json?.data ? toCar(json.data) : null;
}

export async function getAllSlugs(): Promise<string[]> {
  const cars = await getCars();
  return cars.map((c) => c.slug);
}
