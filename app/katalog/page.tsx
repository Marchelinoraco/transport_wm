import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import KatalogClient from "./KatalogClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Katalog Mobil — Rental Mobil & Transportasi Manado",
  description:
    "Lihat daftar lengkap mobil rental di Manado: MPV, SUV, Sedan, City Car, Minibus. Filter & cari mobil sesuai kebutuhan Anda.",
  alternates: { canonical: "/katalog" },
};

export default async function KatalogPage() {
  const cars = await getCars().catch(() => []);
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <KatalogClient cars={cars} />
    </section>
  );
}
