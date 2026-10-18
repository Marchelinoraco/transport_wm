"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, KeyRound, X } from "lucide-react";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { type Paket, paketTersedia } from "@/lib/paket";
import { RINGKASAN_PAKET } from "@/lib/ringkasan-paket";
import BookingForm from "./BookingForm";
import TanyaButton from "./TanyaButton";
import PhotoGallery from "./PhotoGallery";
import TrustStrip from "./TrustStrip";
import StickyBookingBar from "./StickyBookingBar";
import ScrollReveal from "./ScrollReveal";
import KartuPaket from "./detail/KartuPaket";
import TabelBiayaArea from "./detail/TabelBiayaArea";
import PerluDiketahui from "./detail/PerluDiketahui";
import MobilSerupa from "./detail/MobilSerupa";

const label = "rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest";

/**
 * Susunan A: informasi di kiri, kotak booking ringkas yang menempel di kanan.
 * Di HP semuanya bertumpuk dan kotak booking tepat setelah kartu paket —
 * satu elemen DOM yang dipindah lewat grid, bukan dirender dua kali.
 */
export default function CarDetailBody({ car, serupa }: { car: Car; serupa: Car[] }) {
  const { dict, locale } = useLang();
  const pilihan = paketTersedia(car);
  const [paket, setPaket] = useState<Paket>(pilihan[0] ?? "full_day");
  const adaPaket = pilihan.length > 0;

  // Tombol chat melayang pindah ke kiri di halaman ini (≥ 1024 px) agar tidak menutupi kotak booking.
  useEffect(() => {
    document.documentElement.dataset.halaman = "detail";
    return () => {
      delete document.documentElement.dataset.halaman;
    };
  }, []);

  const description =
    (locale === "en" && car.description_en) ||
    (locale === "ko" && car.description_ko) ||
    (locale === "zh" && car.description_zh) ||
    car.description;

  const spesifikasi = [
    car.year != null && String(car.year),
    car.seats != null && `${car.seats} ${dict.car.seats}`,
    car.transmission,
    car.fuel,
  ].filter(Boolean) as string[];
  const ringkasan = RINGKASAN_PAKET[paket];
  const kiri = "lg:col-span-2";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
        <Link href="/" className="transition hover:text-red-600">{dict.car.breadcrumbHome}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/katalog" className="transition hover:text-red-600">{dict.car.breadcrumbCatalog}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700 dark:text-slate-200">{car.name}</span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-x-10">
        <div className={kiri}>
          <PhotoGallery images={car.images} name={car.name} />
        </div>

        <div className={kiri}>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">{car.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {car.type && <span className={`${label} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`}>{car.type}</span>}
            <span
              className={`${label} inline-flex items-center gap-1.5 ${
                car.status === "tersedia"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${car.status === "tersedia" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {car.status === "tersedia" ? dict.car.available : dict.car.rented}
            </span>
            {pilihan.includes("self_drive") && (
              <span className={`${label} inline-flex items-center gap-1.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400`}>
                <KeyRound className="h-3 w-3" /> {dict.paket.self_drive}
              </span>
            )}
            {spesifikasi.map((s) => (
              <span key={s} className={`${label} border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400`}>{s}</span>
            ))}
          </div>
        </div>

        {adaPaket && (
          <div className={kiri}>
            <KartuPaket car={car} paket={paket} onPilih={setPaket} />
          </div>
        )}

        {/* Kotak booking: di HP tepat setelah kartu paket; di laptop kolom kanan yang menempel. */}
        <aside className="self-start lg:sticky lg:top-24 lg:col-start-3 lg:row-start-1 lg:[grid-row-end:span_8]">
          <BookingForm car={car} />
          <TanyaButton car={car} />
        </aside>

        {adaPaket && (
          <ScrollReveal className={`${kiri} grid gap-4 sm:grid-cols-2`}>
            <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.booking.included}</p>
              <ul key={paket} className="mt-3 animate-fade-in-up space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {ringkasan.termasuk[locale].map((t) => (
                  <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.booking.excluded}</p>
              <ul key={paket} className="mt-3 animate-fade-in-up space-y-2 text-sm text-slate-500 dark:text-slate-400">
                {ringkasan.tidakTermasuk[locale].map((t) => (
                  <li key={t} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {t}</li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        )}

        {adaPaket && (
          <ScrollReveal className={`${kiri} grid gap-4 sm:grid-cols-2`}>
            <TabelBiayaArea car={car} paket={paket} />
            <PerluDiketahui car={car} paket={paket} />
          </ScrollReveal>
        )}

        {description && (
          <ScrollReveal className={kiri}>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{dict.car.description}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
          </ScrollReveal>
        )}

        <ScrollReveal className={kiri}>
          <MobilSerupa cars={serupa} />
        </ScrollReveal>
      </div>

      <div className="mt-14">
        <TrustStrip compact />
      </div>
      <StickyBookingBar car={car} />
    </section>
  );
}
