import type { Metadata } from "next";
import { ShieldCheck, Users, Heart, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tentang Welcome Manado Transport — Rental Mobil Manado",
  description:
    "Welcome Manado Transport adalah layanan rental mobil & transportasi terpercaya di Kota Manado, Sulawesi Utara — bagian dari Welcome Manado Holiday.",
  alternates: { canonical: "/tentang" },
};

export default function TentangPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">Tentang Welcome Manado Transport</h1>
      <p className="mt-5 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong className="text-red-600">Welcome Manado Transport</strong> adalah layanan
        rental mobil &amp; transportasi dari Welcome Manado Holiday di Kota Manado,
        Sulawesi Utara. Kami hadir untuk memudahkan Anda menyewa mobil
        berkualitas — Full day dengan sopir, transfer, maupun lepas kunci — dengan proses
        yang cepat, transparan, dan langsung lewat WhatsApp.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Baik untuk kebutuhan harian, perjalanan dinas, liburan keluarga ke
        Tomohon dan Bunaken, maupun acara spesial — Welcome Manado Transport punya armada yang
        sesuai dengan kebutuhan dan anggaran Anda.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Terpercaya", d: "Mitra terverifikasi & mobil terawat." },
          { icon: Users, t: "Berpengalaman", d: "Melayani ribuan pelanggan di Sulut." },
          { icon: Heart, t: "Pelayanan Ramah", d: "Respon cepat & solusi terbaik." },
        ].map((v) => (
          <div key={v.t} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <v.icon className="mx-auto h-8 w-8 text-red-600" />
            <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{v.t}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 p-8 text-center dark:bg-red-900/10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Punya pertanyaan?</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Tim kami siap membantu Anda kapan saja.</p>
        <a
          href={waLink("Halo Welcome Manado Transport, saya ingin bertanya.")}
          target="_blank"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" /> Chat WhatsApp
        </a>
      </div>
    </section>
  );
}
