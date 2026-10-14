import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import LandingTemplate from "@/components/LandingTemplate";
import { hargaPaket } from "@/lib/paket";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sewa Mobil Lepas Kunci Manado — Tanpa Sopir",
  description:
    "Sewa mobil lepas kunci di Manado tanpa sopir, bebas berkendara sendiri. Syarat mudah, harga jelas, armada terawat. Booking cepat via WhatsApp bersama Welcome Manado Transport.",
  alternates: { canonical: "/sewa-mobil-lepas-kunci-manado" },
  openGraph: {
    title: "Sewa Mobil Lepas Kunci Manado — Tanpa Sopir | Welcome Manado Transport",
    description:
      "Sewa mobil lepas kunci di Manado tanpa sopir. Syarat mudah, harga jelas. Booking via WhatsApp.",
    url: "/sewa-mobil-lepas-kunci-manado",
    type: "website",
  },
};

export default async function Page() {
  const cars = await getCars().catch(() => []);
  // Hanya unit yang memang disewakan lepas kunci (punya harga lepas kunci).
  const rental = cars.filter((c) => hargaPaket(c, "self_drive") !== null);

  return (
    <LandingTemplate
      eyebrow="Sewa Lepas Kunci di Manado"
      title="Sewa Mobil Lepas Kunci Manado"
      intro="Ingin berkendara sendiri menjelajahi Manado, Tomohon, hingga Likupang? Welcome Manado Transport menyediakan sewa mobil lepas kunci (tanpa sopir) dengan syarat yang mudah dan harga yang transparan. Pilih dari city car irit hingga MPV keluarga, semua unit terawat dan siap pakai."
      highlights={[
        "Bebas berkendara sendiri",
        "Syarat mudah & cepat",
        "Unit terawat & bersih",
        "Harga harian/mingguan/bulanan",
      ]}
      carsHeading="Mobil Tersedia untuk Lepas Kunci"
      cars={rental}
      waMessage="Halo Welcome Manado Transport, saya ingin sewa mobil lepas kunci (tanpa sopir) di Manado. Apa saja syaratnya?"
      path="/sewa-mobil-lepas-kunci-manado"
      breadcrumbName="Sewa Mobil Lepas Kunci Manado"
      sections={[
        {
          heading: "Apa itu sewa lepas kunci?",
          body: "Sewa lepas kunci berarti Anda mengemudikan mobil sendiri tanpa sopir, sehingga lebih fleksibel dan privat. Welcome Manado Transport menawarkan opsi ini untuk Anda yang sudah terbiasa menyetir dan ingin mengatur perjalanan sesuai keinginan, baik untuk urusan kerja maupun liburan keliling Sulawesi Utara.",
        },
        {
          heading: "Syarat sewa lepas kunci",
          body: "Umumnya cukup KTP, SIM A yang masih berlaku, dan jaminan sesuai kesepakatan dengan mitra rental. Persyaratan detail dan ketentuan deposit akan dikonfirmasi langsung via WhatsApp agar jelas dan transparan sebelum Anda booking.",
        },
        {
          heading: "Tips sewa mobil di Manado",
          body: "Pesan lebih awal terutama saat musim liburan dan akhir pekan, karena unit populer seperti Avanza dan Innova cepat habis. Pastikan rute perjalanan Anda — medan Tomohon dan Modoinding berbukit, jadi pilih mobil dengan tenaga yang sesuai. Tim kami siap membantu merekomendasikan unit terbaik.",
        },
      ]}
    />
  );
}
