"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Users, Fuel, Settings2, Calendar,
  UserCheck, Check, GitCompareArrows,
} from "lucide-react";
import { Car } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { useCompare } from "./CompareProvider";

const badgeColor: Record<string, string> = {
  POPULER: "bg-red-600 text-white",
  BARU:    "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
  PROMO:   "bg-amber-500 text-white",
};

export default function CarCard({ car }: { car: Car }) {
  const { has, toggle, full } = useCompare();
  const { dict } = useLang();
  const selected   = has(car.id);
  const photoCount = car.images.length;

  const statusLabel =
    car.status === "tersedia" ? dict.car.available : dict.car.rented;

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/10 dark:border-slate-800 dark:bg-slate-900">

      {/* Tombol banding */}
      <button
        onClick={() => toggle(car)}
        disabled={!selected && full}
        title={dict.footer.compare}
        className={`absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full transition ${
          selected
            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
            : "bg-white/90 text-slate-500 shadow backdrop-blur-sm hover:bg-white hover:text-slate-700 disabled:opacity-40 dark:bg-slate-900/80 dark:text-slate-400"
        }`}
      >
        {selected ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
      </button>

      <Link href={`/mobil/${car.slug}`} className="block">
        {/* ── Gambar ── */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {car.images[0] ? (
            <>
              <Image
                src={car.images[0]}
                alt={car.year ? `${car.name} ${car.year}` : car.name}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              {/* Scrim gradasi saat hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {dict.compare.noPhoto}
            </div>
          )}

          {/* Badge kiri atas */}
          <div className="absolute left-4 top-4 flex gap-1.5">
            {car.badge && (
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${badgeColor[car.badge]}`}>
                {car.badge}
              </span>
            )}
            {car.dengan_sopir && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:text-slate-200">
                <UserCheck className="h-3 w-3 text-red-600" /> {dict.car.driverBadge}
              </span>
            )}
          </div>

          {/* Tipe + jumlah foto */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            {car.type && (
              <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:text-slate-300">
                {car.type}
              </span>
            )}
            {photoCount > 0 && (
              <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:text-slate-400">
                {photoCount} {dict.car.photos}
              </span>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              {car.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                car.status === "tersedia"
                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {car.year != null && (
              <span className="flex items-center gap-1.5"><Calendar  className="h-3.5 w-3.5 text-red-400" /> {car.year}</span>
            )}
            {car.seats != null && (
              <span className="flex items-center gap-1.5"><Users     className="h-3.5 w-3.5 text-red-400" /> {car.seats} {dict.car.seats}</span>
            )}
            {car.transmission && (
              <span className="flex items-center gap-1.5"><Settings2 className="h-3.5 w-3.5 text-red-400" /> {car.transmission}</span>
            )}
            {car.fuel && (
              <span className="flex items-center gap-1.5"><Fuel      className="h-3.5 w-3.5 text-red-400" /> {car.fuel}</span>
            )}
          </div>

          {/* ── Harga (pill merah) + tombol detail ── */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <span className="rounded-xl bg-red-600 px-3.5 py-2 text-sm font-black text-white shadow-lg shadow-red-600/20">
              {formatRupiah(car.price_rent)}
              <span className="ml-0.5 text-[10px] font-bold opacity-80">
                {car.price_unit === "per_trip" ? dict.car.perTrip : dict.car.perDay}
              </span>
            </span>

            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 transition group-hover:text-red-600">
              {dict.car.detail} →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
