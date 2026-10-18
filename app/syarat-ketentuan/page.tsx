import type { Metadata } from "next";
import SyaratKetentuanContent from "@/components/SyaratKetentuanContent";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Sewa",
  description:
    "Syarat dan ketentuan sewa kendaraan Welcome Manado Transport: paket Full day, Transfer, Lepas kunci, biaya area, pembatalan, dan tanggung jawab penyewa.",
  alternates: { canonical: "/syarat-ketentuan" },
};

export default function Page() {
  return <SyaratKetentuanContent />;
}
