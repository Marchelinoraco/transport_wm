import type { Metadata } from "next";
import { getCars } from "@/lib/api";
import LandingTemplate from "@/components/LandingTemplate";
import { unitHiace, deskripsiHiace } from "@/lib/hiace";
import { AREA_SEWA, TARIF_PELAYANAN, rp } from "@/lib/tarif-sewa";

export const revalidate = 60;

const JUDUL = "Sewa Hiace Manado 14 Kursi dengan Sopir";

export async function generateMetadata(): Promise<Metadata> {
  const cars = await getCars().catch(() => []);
  const description = deskripsiHiace(cars);
  return {
    title: JUDUL,
    description,
    keywords: ["sewa hiace manado", "rental hiace manado", "sewa hiace commuter manado", "sewa hiace premio manado", "sewa hiace per hari manado"],
    alternates: { canonical: "/sewa-hiace-manado" },
    openGraph: {
      title: `${JUDUL} | Welcome Manado Transport`,
      description,
      url: "/sewa-hiace-manado",
      type: "website",
    },
  };
}

export default async function Page() {
  const cars = await getCars().catch(() => []);

  return (
    <LandingTemplate
      eyebrow="Hiace 14 Kursi dengan Sopir"
      title="Sewa Hiace Manado untuk Rombongan"
      intro="Pergi rombongan keluarga, kantor, atau tamu perusahaan di Manado? Welcome Manado Transport menyewakan Toyota Hiace untuk rombongan sampai 14 orang, selalu dengan sopir. Pilih Hiace Commuter yang hemat atau Hiace Premio yang lebih premium, untuk Full day 12 jam atau Transfer sekali jalan — termasuk antar-jemput rombongan di Bandara Sam Ratulangi."
      highlights={[
        "Kapasitas sampai 14 penumpang",
        "Sudah termasuk sopir",
        "Antar-jemput Bandara Sam Ratulangi",
        "Full day 12 jam atau Transfer",
      ]}
      carsHeading="Pilihan Hiace di Manado"
      cars={unitHiace(cars)}
      waMessage="Halo Welcome Manado Transport, saya ingin sewa Hiace di Manado untuk rombongan. Boleh info ketersediaan & harga?"
      path="/sewa-hiace-manado"
      breadcrumbName="Sewa Hiace Manado"
      sections={[
        {
          heading: "Hiace Commuter atau Hiace Premio?",
          body: "Keduanya minibus Toyota untuk rombongan sampai 14 orang. **Hiace Commuter** adalah pilihan paling hemat untuk rombongan wisata, keluarga besar, atau antar-jemput karyawan. **Hiace Premio** adalah versi premium dengan kabin lebih lega dan nyaman (11–14 kursi, tergantung konfigurasi) — cocok untuk tamu perusahaan, perjalanan dinas, atau rute jauh. Harga terbaru tiap unit tercantum pada kartu di atas.",
        },
        {
          heading: "Apa saja yang termasuk dalam sewa Hiace?",
          body: `Paket **Full day** berlaku sampai 12 jam per hari dan sudah termasuk sopir beserta uang makannya, BBM sampai ${TARIF_PELAYANAN.batasKmPerHari} km per hari, serta parkir sampai ${rp(TARIF_PELAYANAN.batasParkirPerHari)} per hari. Lewat dari 12 jam dikenakan over time per jam. Paket **Transfer** adalah sekali jalan dengan sopir — paling pas untuk menjemput atau mengantar rombongan di Bandara Sam Ratulangi. Tol dan tiket masuk tempat wisata belum termasuk. Hiace hanya disewakan dengan sopir, tidak lepas kunci.`,
        },
        {
          heading: "Biaya untuk tujuan di luar Kota Manado",
          body: `Untuk tujuan di luar Kota Manado berlaku **Biaya Area** per hari, misalnya ke ${AREA_SEWA[1].wilayah}. Besarnya tercantum di halaman tiap unit dan dihitung otomatis di form booking, jadi total yang Anda lihat sama dengan yang ditagihkan. Ketentuan lengkapnya ada di [Syarat & Ketentuan](/syarat-ketentuan).`,
        },
        {
          heading: "Tujuan rombongan dari Manado",
          body: "Hiace cocok untuk wisata sehari ke Tomohon dan Danau Tondano, perjalanan ke pantai-pantai di Likupang, kunjungan kerja ke Bitung, hingga city tour di dalam Kota Manado. Rombongan yang baru mendarat bisa langsung dijemput di bandara — baca juga [panduan sewa mobil dari Bandara Sam Ratulangi](/blog/sewa-mobil-bandara-sam-ratulangi).",
        },
        {
          heading: "Rombongan lebih dari 14 orang?",
          body: "Untuk rombongan sampai 30 orang, pilih [Bus 30 Seat](/mobil/bus-3033-seater) atau gabungkan dua Hiace. Bandingkan dengan semua unit lain di [daftar harga sewa mobil Manado 2026](/blog/harga-sewa-mobil-manado-2026).",
        },
      ]}
    />
  );
}
