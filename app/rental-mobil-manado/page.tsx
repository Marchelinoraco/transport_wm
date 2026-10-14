import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import LandingTemplate from "@/components/LandingTemplate";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rental Mobil Manado Murah & Terpercaya",
  description:
    "Rental mobil Manado murah & terpercaya. Full day dengan sopir, transfer bandara, atau lepas kunci — Avanza, Xpander, Innova, Fortuner, Alphard, Hiace, Bus. Pesan cepat via WhatsApp.",
  alternates: { canonical: "/rental-mobil-manado" },
  openGraph: {
    title: "Rental Mobil Manado Murah & Terpercaya | Welcome Manado Transport",
    description:
      "Sewa mobil di Manado: Full day dengan sopir, transfer, atau lepas kunci. Pesan cepat via WhatsApp.",
    url: "/rental-mobil-manado",
    type: "website",
  },
};

export default async function Page() {
  const cars = await getCars().catch(() => []);
  const rental = cars;

  return (
    <LandingTemplate
      eyebrow="Rental Mobil #1 di Kota Manado"
      title="Rental Mobil Manado Murah & Terpercaya"
      intro="Welcome Manado Transport menyediakan rental mobil di Kota Manado dengan harga transparan tanpa biaya tersembunyi. Tersedia armada lengkap mulai dari city car, MPV keluarga seperti Avanza dan Innova, SUV Fortuner, hingga mobil mewah Alphard dan Hiace untuk rombongan. Pilih paket Full day dengan sopir (maks. 12 jam), Transfer sekali jalan, atau Lepas kunci untuk unit tertentu."
      highlights={[
        "Harga transparan, tanpa biaya tersembunyi",
        "Lepas kunci atau dengan sopir",
        "Antar-jemput Bandara Sam Ratulangi",
        "Full day, Transfer, atau Lepas kunci",
      ]}
      carsHeading="Pilihan Mobil Rental di Manado"
      cars={rental}
      waMessage="Halo Welcome Manado Transport, saya ingin menyewa mobil di Manado. Boleh info ketersediaan & harga?"
      path="/rental-mobil-manado"
      breadcrumbName="Rental Mobil Manado"
      sections={[
        {
          heading: "Kenapa rental mobil di Welcome Manado Transport?",
          body: "Kami menghubungkan Anda dengan armada terawat dan mitra rental terpercaya di Manado. Setiap unit dicek kondisinya, harga dikonfirmasi langsung sebelum booking, dan proses pemesanan cukup lewat WhatsApp — tanpa aplikasi, tanpa ribet. Cocok untuk perjalanan dinas, liburan keluarga, maupun kebutuhan harian.",
        },
        {
          heading: "Area layanan rental mobil",
          body: "Welcome Manado Transport melayani Kota Manado dan sekitarnya: Tomohon, Bitung, Minahasa, Airmadidi, hingga kawasan wisata Likupang dan Bunaken. Layanan antar-jemput Bandara Sam Ratulangi juga tersedia agar perjalanan Anda lebih praktis sejak tiba di Manado.",
        },
        {
          heading: "Pilihan paket: Full day, Transfer, Lepas kunci",
          body: "Full day adalah sewa dengan sopir sampai 12 jam per hari, sudah termasuk BBM sampai 120 km dan uang makan sopir. Transfer adalah sekali jalan dengan sopir, cocok untuk antar-jemput Bandara Sam Ratulangi. Lepas kunci tersedia untuk Avanza, Xpander, dan Innova Reborn. Untuk sewa mingguan atau bulanan, hubungi kami via WhatsApp untuk penawaran khusus.",
        },
      ]}
    />
  );
}
