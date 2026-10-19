"use client";

import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill } from "@/lib/i18n/format";
import type { Paket } from "@/lib/paket";
import { type BarisArea, tabelBiayaArea } from "@/lib/biayaArea";
import { NAMA_AREA } from "@/lib/tarif-sewa";
import { formatRupiah } from "@/lib/whatsapp";

/** Biaya area / antar-jemput untuk mobil & paket ini — angka dari hitungBooking, sama dengan kotak booking. */
export default function TabelBiayaArea({ car, paket }: { car: Car; paket: Paket }) {
  const { dict, locale } = useLang();
  const baris = tabelBiayaArea(car, paket);
  if (!baris) return null;

  const judul = paket === "self_drive" ? dict.detail.areaTitleSelfDrive : paket === "transfer" ? dict.detail.areaTitleTransfer : dict.detail.areaTitleFullDay;
  const nama = (b: BarisArea) =>
    b.area === "pool" ? dict.detail.pool : b.area === 4 ? dict.area.area4 : `${fill(dict.detail.areaName, { n: b.area })} · ${NAMA_AREA[locale][b.area]}`;
  const nilai = (b: BarisArea) =>
    b.status === "gratis" ? dict.detail.free
      : b.status === "termasuk" ? dict.detail.included
      : b.status === "dikonfirmasi" ? dict.detail.confirm
      : `${formatRupiah(b.nominal)}${b.perHari ? dict.detail.perDayShort : ""}`;

  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{judul}</p>
      <dl key={paket} className="mt-3 animate-fade-in-up divide-y divide-dashed divide-slate-200 text-sm dark:divide-slate-700">
        {baris.map((b) => (
          <div key={String(b.area)} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="text-slate-500 dark:text-slate-400">{nama(b)}</dt>
            <dd className={`shrink-0 text-right font-bold ${b.status === "dikonfirmasi" ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>{nilai(b)}</dd>
          </div>
        ))}
      </dl>
      {paket === "self_drive" && <p className="mt-2 text-[11px] text-slate-400">{dict.detail.oncePerBooking}</p>}
    </div>
  );
}
