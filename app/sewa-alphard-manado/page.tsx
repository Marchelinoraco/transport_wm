import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import LandingTemplate from "@/components/LandingTemplate";
import { unitAlphard, deskripsiAlphard } from "@/lib/alphard";
import { daftarNama, paragrafBiayaArea, paragrafPaketDenganSopir } from "@/lib/landing";

export const revalidate = 60;

const JUDUL = "Sewa Alphard Manado dengan Sopir — VIP & Wedding";

export async function generateMetadata(): Promise<Metadata> {
  const cars = await getCars().catch(() => []);
  const description = deskripsiAlphard(cars);
  return {
    title: JUDUL,
    description,
    keywords: ["sewa alphard manado", "rental alphard manado", "sewa alphard wedding manado", "mobil pengantin manado", "sewa alphard bandara manado"],
    alternates: { canonical: "/sewa-alphard-manado" },
    openGraph: {
      title: `${JUDUL} | Welcome Manado Transport`,
      description,
      url: "/sewa-alphard-manado",
      type: "website",
    },
  };
}

export default async function Page() {
  const cars = await getCars().catch(() => []);
  const alphard = unitAlphard(cars);
  const pilihan = alphard.length ? ` Pilihan unit saat ini: ${daftarNama(alphard.map((c) => c.name))}.` : "";

  return (
    <LandingTemplate
      eyebrow="Alphard dengan Sopir di Manado"
      title="Sewa Alphard Manado"
      intro={`Butuh kendaraan yang berkesan untuk tamu VIP, mobil pengantin, atau perjalanan dinas? Welcome Manado Transport menyewakan Toyota Alphard di Manado, selalu dengan sopir, untuk Full day 12 jam atau Transfer sekali jalan dari dan ke Bandara Sam Ratulangi.${pilihan}`}
      highlights={[
        "Selalu dengan sopir",
        "Untuk tamu VIP & pernikahan",
        "Jemput Bandara Sam Ratulangi",
        "Full day 12 jam atau Transfer",
      ]}
      carsHeading="Pilihan Alphard di Manado"
      cars={alphard}
      waMessage="Halo Welcome Manado Transport, saya ingin sewa Alphard di Manado. Boleh info ketersediaan & harga?"
      path="/sewa-alphard-manado"
      breadcrumbName="Sewa Alphard Manado"
      sections={[
        {
          heading: "Untuk acara apa sewa Alphard di Manado?",
          body: "Alphard adalah MPV premium dengan kabin luas dan interior mewah. Di Manado, Alphard cocok sebagai **mobil pengantin** dan kendaraan keluarga inti, untuk **menjemput tamu VIP atau pejabat** di bandara, **perjalanan dinas**, serta tamu perusahaan yang membutuhkan kesan profesional. Harga terbaru tiap unit tercantum pada kartu di atas.",
        },
        {
          heading: "Apa saja yang termasuk dalam sewa Alphard?",
          body: paragrafPaketDenganSopir("Alphard"),
        },
        {
          heading: "Biaya untuk tujuan di luar Kota Manado",
          body: paragrafBiayaArea(),
        },
        {
          heading: "Jemput tamu di Bandara Sam Ratulangi",
          body: "Paket Transfer sekali jalan cocok untuk menjemput tamu dari bandara langsung ke hotel atau lokasi acara. Baca juga [panduan sewa mobil dari Bandara Sam Ratulangi](/blog/sewa-mobil-bandara-sam-ratulangi).",
        },
        {
          heading: "Untuk rombongan?",
          body: "Alphard paling nyaman untuk tamu dalam jumlah kecil. Untuk rombongan sampai 14 orang, pilih [sewa Hiace Manado](/sewa-hiace-manado). Bandingkan semua unit di [daftar harga sewa mobil Manado 2026](/blog/harga-sewa-mobil-manado-2026).",
        },
      ]}
    />
  );
}
