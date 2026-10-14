"use client";

import Link from "next/link";
import {
  Users, Fuel, Settings2, Calendar, Car as CarIcon,
  Zap, BadgeCheck, ChevronRight, KeyRound,
} from "lucide-react";
import { Car } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import BookingForm from "./BookingForm";
import TanyaButton from "./TanyaButton";
import PhotoGallery from "./PhotoGallery";
import TrustStrip from "./TrustStrip";
import { type Paket, adaHarga, hargaPaket, paketTersedia } from "@/lib/paket";
import { HARGA_BERLAKU_SEJAK, TARIF_LEPAS_KUNCI } from "@/lib/tarif-sewa";
import { fill, formatTanggal } from "@/lib/i18n/format";

export default function CarDetailBody({ car }: { car: Car }) {
  const { dict, locale } = useLang();

  const description =
    (locale === "en" && car.description_en) ||
    (locale === "ko" && car.description_ko) ||
    (locale === "zh" && car.description_zh) ||
    car.description;

  const pilihan = paketTersedia(car);
  const catatanPaket: Record<Paket, string> = {
    full_day: dict.paket.full_dayNote,
    transfer: dict.paket.transferNote,
    self_drive: dict.paket.self_driveNote,
  };

  const specs = [
    car.year != null && { icon: Calendar, l: dict.car.year, v: String(car.year) },
    car.seats != null && { icon: Users, l: dict.car.seatsLabel, v: `${car.seats} ${dict.car.seats}` },
    car.transmission && { icon: Settings2, l: dict.car.transmission, v: car.transmission },
    car.fuel && { icon: Fuel, l: dict.car.fuel, v: car.fuel },
  ].filter(Boolean) as { icon: typeof Calendar; l: string; v: string }[];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
        <Link href="/" className="transition hover:text-red-600">
          {dict.car.breadcrumbHome}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/katalog" className="transition hover:text-red-600">
          {dict.car.breadcrumbCatalog}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700 dark:text-slate-200">{car.name}</span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-3">
        {/* ── KIRI: Galeri + Info ── */}
        <div className="lg:col-span-2">
          <PhotoGallery images={car.images} name={car.name} />

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              {car.type && (
                <span className="rounded-full border border-slate-100 bg-slate-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  {car.type}
                </span>
              )}
              {pilihan.includes("self_drive") && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <KeyRound className="h-3 w-3" /> {dict.paket.self_drive}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
              {car.name}
            </h1>

            {specs.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {specs.map((s) => (
                  <div
                    key={s.l}
                    className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <s.icon className="h-5 w-5 text-red-600" />
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {s.l}
                    </p>
                    <p className="mt-0.5 font-black tracking-tight text-slate-900 dark:text-white">
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {description && (
              <div className="mt-8">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  <CarIcon className="h-5 w-5 text-red-600" /> {dict.car.description}
                </h2>
                <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── KANAN: Harga + Aksi (sticky di desktop) ── */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div id="kartu-harga" className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {pilihan.length > 0 ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.paket.title}</p>
                <ul className="mt-3 space-y-3">
                  {pilihan.map((p) => (
                    <li key={p} className="flex items-baseline justify-between gap-3">
                      <span>
                        <span className="block font-black text-slate-900 dark:text-white">{dict.paket[p]}</span>
                        <span className="block text-xs text-slate-400">{catatanPaket[p]}</span>
                      </span>
                      <span className="shrink-0 text-right text-xl font-black tracking-tight text-red-600">
                        {formatRupiah(hargaPaket(car, p))}
                        <span className="text-xs font-bold text-slate-400">
                          {p === "transfer" ? dict.paket.perTrip : dict.paket.perDay}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {adaHarga(car.price_overtime) && (
                    <p>
                      {dict.paket.overtime}: <b className="text-slate-700 dark:text-slate-200">{formatRupiah(car.price_overtime)}</b>
                      {dict.paket.overtimeNote}
                    </p>
                  )}
                  {pilihan.includes("self_drive") && (
                    <p>
                      {dict.paket.lateReturn}:{" "}
                      <b className="text-slate-700 dark:text-slate-200">{formatRupiah(TARIF_LEPAS_KUNCI.keterlambatanPerJam)}</b>
                      {dict.paket.lateReturnNote}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-2xl font-black tracking-tight text-slate-700 dark:text-slate-200">{dict.paket.askPrice}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  car.status === "tersedia"
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                }`}
              >
                {car.status === "tersedia" ? dict.car.available : dict.car.rented}
              </span>
              {car.images.length > 0 && (
                <span className="text-xs font-medium text-slate-400">
                  {car.images.length} {dict.car.photosAvailable}
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
              <p className="flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400">
                <Zap className="h-3.5 w-3.5 text-red-600" /> {dict.car.fastResponse}
              </p>
              <p className="flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400">
                <BadgeCheck className="h-3.5 w-3.5 text-red-600" /> {dict.car.transparent}
              </p>
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              {fill(dict.paket.validSince, { date: formatTanggal(HARGA_BERLAKU_SEJAK, locale) })}
            </p>
          </div>

          <TanyaButton car={car} />
          <BookingForm car={car} />
        </div>
      </div>

      <div className="mt-14">
        <TrustStrip compact />
      </div>
    </section>
  );
}
