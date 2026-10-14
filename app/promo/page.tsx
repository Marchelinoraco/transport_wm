import type { Metadata } from "next";
import { Tag, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Promo & Penawaran Rental Mobil Manado",
  description:
    "Penawaran rental mobil Manado: harga khusus sewa mingguan & bulanan, transfer Bandara Sam Ratulangi, dan paket wisata dari Welcome Manado Transport.",
};

const promos = [
  {
    title: "Sewa Mingguan & Bulanan",
    desc: "Butuh mobil untuk seminggu atau sebulan? Tanyakan harga khusus via WhatsApp sesuai unit, durasi, dan tujuan Anda.",
    tag: "JANGKA PANJANG",
  },
  {
    title: "Transfer Bandara Sam Ratulangi",
    desc: "Antar atau jemput bandara dengan sopir, dihitung per trip. Harga tiap unit tercantum di halaman mobilnya.",
    tag: "TRANSFER",
  },
  {
    title: "Paket Wisata Tomohon & Bunaken",
    desc: "Mobil + sopir berpengalaman untuk liburan keluarga dengan paket Full day sampai 12 jam.",
    tag: "WISATA",
  },
];

export default function PromoPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">Promo &amp; Penawaran</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Penawaran terbaik untuk Anda di Kota Manado.</p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {promos.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-200 dark:border-red-900/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
              <Tag className="h-3 w-3" /> {p.tag}
            </span>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{p.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{p.desc}</p>
            <a
              href={waLink(`Halo Welcome Manado Transport, saya tertarik dengan promo: ${p.title}`)}
              target="_blank"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <MessageCircle className="h-4 w-4" /> Tanya Penawaran
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
