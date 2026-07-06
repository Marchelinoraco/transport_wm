import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import LandingTemplate from "@/components/LandingTemplate";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rental Mobil Manado Murah & Terpercaya",
  description:
    "Rental mobil Manado murah & terpercaya. Sewa harian, mingguan, bulanan — Avanza, Innova, Fortuner, Alphard, Hiace. Lepas kunci atau dengan sopir. Pesan cepat via WhatsApp.",
  alternates: { canonical: "/rental-mobil-manado" },
  openGraph: {
    title: "Rental Mobil Manado Murah & Terpercaya | Welcome Manado Transport",
    description:
      "Sewa mobil di Manado: harian, mingguan, bulanan. Lepas kunci atau dengan sopir. Pesan cepat via WhatsApp.",
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
      intro="Welcome Manado Transport menyediakan rental mobil di Kota Manado dengan harga transparan tanpa biaya tersembunyi. Tersedia armada lengkap mulai dari city car, MPV keluarga seperti Avanza dan Innova, SUV Fortuner, hingga mobil mewah Alphard dan Hiace untuk rombongan. Sewa harian, mingguan, atau bulanan — bisa lepas kunci maupun dengan sopir berpengalaman."
      highlights={[
        "Harga transparan, tanpa biaya tersembunyi",
        "Lepas kunci atau dengan sopir",
        "Antar-jemput Bandara Sam Ratulangi",
        "Diskon sewa mingguan & bulanan",
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
          heading: "Pilihan sewa harian, mingguan & bulanan",
          body: "Butuh mobil satu hari untuk meeting, atau sebulan penuh untuk proyek? Kami fleksibel. Sewa mingguan otomatis mendapat diskon 10% dan sewa bulanan diskon 20%. Hubungi kami untuk penawaran terbaik sesuai durasi dan jenis mobil yang Anda butuhkan.",
        },
      ]}
    />
  );
}
