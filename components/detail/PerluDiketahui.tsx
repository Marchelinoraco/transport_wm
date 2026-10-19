"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill, formatTanggal } from "@/lib/i18n/format";
import { type Paket, adaHarga } from "@/lib/paket";
import { HARGA_BERLAKU_SEJAK, TARIF_LEPAS_KUNCI } from "@/lib/tarif-sewa";
import { formatRupiah } from "@/lib/whatsapp";

export default function PerluDiketahui({ car, paket }: { car: Car; paket: Paket }) {
  const { dict, locale } = useLang();
  const butir = [
    paket !== "self_drive" && adaHarga(car.price_overtime) && fill(dict.detail.infoOvertime, { price: formatRupiah(car.price_overtime) }),
    paket === "self_drive" && fill(dict.detail.infoLate, { price: formatRupiah(TARIF_LEPAS_KUNCI.keterlambatanPerJam) }),
    dict.detail.infoCancel,
    paket === "self_drive" && dict.detail.infoDeposit,
    fill(dict.paket.validSince, { date: formatTanggal(HARGA_BERLAKU_SEJAK, locale) }),
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Info className="h-3.5 w-3.5" /> {dict.detail.goodToKnow}
      </p>
      <ul key={paket} className="mt-3 animate-fade-in-up space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {butir.map((t) => (
          <li key={t} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-500" />{t}</li>
        ))}
      </ul>
      <Link href="/syarat-ketentuan" className="mt-3 inline-block text-xs font-bold text-red-600 underline underline-offset-2 hover:text-red-700">
        {dict.detail.seeTerms}
      </Link>
    </div>
  );
}
