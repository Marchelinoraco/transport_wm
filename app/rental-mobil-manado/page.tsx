import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import LandingTemplate from "@/components/LandingTemplate";
import { TARIF_PELAYANAN } from "@/lib/tarif-sewa";
import { judulRental, deskripsiRental, paragrafHargaRental, kalimatLepasKunci } from "@/lib/rentalManado";

export const revalidate = 60;

// Kata kunci utama "rental mobil manado" (posisi ±28 per 19 Nov 2026). Judul,
// deskripsi, harga, dan daftar unit lepas kunci disusun dari data armada —
// lihat lib/rentalManado.ts.
export async function generateMetadata(): Promise<Metadata> {
  const cars = await getCars().catch(() => []);
  const title = judulRental(cars);
  const description = deskripsiRental(cars);
  return {
    title,
    description,
    alternates: { canonical: "/rental-mobil-manado" },
    openGraph: {
      title: `${title} | Welcome Manado Transport`,
      description,
      url: "/rental-mobil-manado",
      type: "website",
    },
  };
}

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
          heading: "Berapa harga rental mobil di Manado?",
          body: paragrafHargaRental(cars),
        },
        {
          heading: "Kenapa rental mobil di Welcome Manado Transport?",
          body: "Kami menghubungkan Anda dengan armada terawat dan mitra rental terpercaya di Manado. Setiap unit dicek kondisinya, harga dikonfirmasi langsung sebelum booking, dan proses pemesanan cukup lewat WhatsApp — tanpa aplikasi, tanpa ribet. Cocok untuk perjalanan dinas, liburan keluarga, maupun kebutuhan harian.",
        },
        {
          heading: "Pilihan paket: Full day, Transfer, Lepas kunci",
          body: `Full day adalah sewa dengan sopir sampai 12 jam per hari, sudah termasuk BBM sampai ${TARIF_PELAYANAN.batasKmPerHari} km dan uang makan sopir. Transfer adalah sekali jalan dengan sopir, cocok untuk antar-jemput Bandara Sam Ratulangi. ${kalimatLepasKunci(cars)} Bedanya dijelaskan di halaman [rental mobil dengan sopir](/rental-mobil-dengan-sopir-manado) dan [sewa mobil lepas kunci](/sewa-mobil-lepas-kunci-manado). Untuk sewa mingguan atau bulanan, hubungi kami via WhatsApp untuk penawaran khusus.`,
        },
        {
          heading: "Mobil untuk rombongan & tamu VIP",
          body: "Untuk rombongan sampai 14 orang tersedia [sewa Hiace Manado](/sewa-hiace-manado), dan untuk rombongan lebih besar [Bus 30 Seat](/mobil/bus-3033-seater). Untuk tamu VIP, mobil pengantin, atau perjalanan dinas, pilih [sewa Alphard Manado](/sewa-alphard-manado).",
        },
        {
          heading: "Area layanan rental mobil",
          body: "Welcome Manado Transport melayani Kota Manado dan sekitarnya: Tomohon, Bitung, Minahasa, Airmadidi, hingga kawasan wisata Likupang dan Bunaken. Layanan antar-jemput Bandara Sam Ratulangi juga tersedia agar perjalanan Anda lebih praktis sejak tiba di Manado — lihat [panduan sewa mobil dari bandara](/blog/sewa-mobil-bandara-sam-ratulangi).",
        },
        {
          heading: "Cara pesan rental mobil",
          body: "Pilih mobil di [katalog](/katalog), isi tanggal dan tujuan di form booking — harga paket, jumlah hari, dan Biaya Area dihitung otomatis — lalu kirim ke WhatsApp. Tim kami mengonfirmasi ketersediaan dan harga final lewat WhatsApp.",
        },
      ]}
    />
  );
}
