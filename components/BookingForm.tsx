"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, CheckCircle2, Loader2, MessageCircle, X } from "lucide-react";
import { Car } from "@/lib/types";
import { formatRupiah, openWhatsApp, waLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill } from "@/lib/i18n/format";
import { type Paket, paketTersedia, adaHarga } from "@/lib/paket";
import { type PilihanArea, hitungBooking, normalisasiJumlah } from "@/lib/hitungBooking";
import { buatPayloadBooking, buatPesanWa } from "@/lib/booking";
import { NAMA_AREA, TARIF_LEPAS_KUNCI } from "@/lib/tarif-sewa";
import { RINGKASAN_PAKET } from "@/lib/ringkasan-paket";
import AnimatedNumber from "./AnimatedNumber";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const AREA_DENGAN_SOPIR: PilihanArea[] = [1, 2, 3, 4];
const AREA_LEPAS_KUNCI: PilihanArea[] = ["pool", 1, 2, 3, 4];

export default function BookingForm({ car }: { car: Car }) {
  const { dict, locale } = useLang();
  const pilihan = paketTersedia(car);

  const [paket, setPaket] = useState<Paket>(pilihan[0] ?? "full_day");
  // Teks mentah isian jumlah: dinormalisasi saat dihitung, bukan saat diketik —
  // kalau dinormalisasi tiap ketukan, isian yang dikosongkan langsung kembali ke
  // "1" dan angka yang diketik sesudahnya menempel (3 → "13").
  const [jumlahTeks, setJumlahTeks] = useState("1");
  const jumlah = normalisasiJumlah(Number(jumlahTeks));
  const [area, setArea] = useState<PilihanArea>(pilihan[0] === "self_drive" ? "pool" : 1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const input = useMemo(() => ({ car, paket, jumlah, area }), [car, paket, jumlah, area]);
  const hasil = useMemo(() => hitungBooking(input), [input]);

  const namaPaket: Record<Paket, string> = {
    full_day: dict.paket.full_day,
    transfer: dict.paket.transfer,
    self_drive: dict.paket.self_drive,
  };
  const catatanPaket: Record<Paket, string> = {
    full_day: dict.paket.full_dayNote,
    transfer: dict.paket.transferNote,
    self_drive: dict.paket.self_driveNote,
  };

  function labelArea(a: PilihanArea): string {
    if (a === "pool") return dict.area.pool;
    if (a === 4) return dict.area.area4;
    return `${fill(dict.area.area, { n: a })} — ${NAMA_AREA[locale][a]}`;
  }

  function pilihPaket(p: Paket) {
    setPaket(p);
    if (p === "self_drive") setArea("pool");
    else if (area === "pool") setArea(1);
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border-none bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600/20 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";

  if (!hasil) {
    return (
      <div id="form-booking" className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
          <CalendarDays className="h-5 w-5 text-red-600" /> {dict.booking.title}
        </h3>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{dict.booking.unavailable}</p>
        <a
          href={waLink(`Halo Welcome Manado Transport, saya ingin menanyakan harga ${car.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-xs font-black uppercase tracking-widest text-white"
        >
          <MessageCircle className="h-5 w-5" /> {dict.paket.askPrice}
        </a>
      </div>
    );
  }

  const harian = paket !== "transfer";
  const satuan = harian ? dict.booking.days : dict.booking.trip;
  const pilihanArea = paket === "self_drive" ? AREA_LEPAS_KUNCI : AREA_DENGAN_SOPIR;
  const ringkasan = RINGKASAN_PAKET[paket];

  async function handleSubmit() {
    if (!hasil) return;
    setError("");
    if (!name.trim()) { setError(dict.booking.errName); return; }
    if (!phone.trim()) { setError(dict.booking.errPhone); return; }
    if (!startDate) { setError(dict.booking.errDate); return; }

    const pemesan = { nama: name, telepon: phone, tanggalMulai: startDate, catatan: note };
    const pesan = buatPesanWa(input, hasil, pemesan);

    setSending(true);
    let ok = false;
    try {
      const res = await fetch(`${API_BASE}/transportation-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buatPayloadBooking(input, hasil, pemesan)),
      });
      ok = res.ok;
    } catch {
      // Booking gagal tersimpan bukan alasan kehilangan lead — tetap lanjut ke WhatsApp
    }
    setSending(false);

    if (ok) {
      setSaved(true);
      setTimeout(() => {
        openWhatsApp(pesan);
        setSaved(false);
      }, 1200);
    } else {
      openWhatsApp(pesan);
    }
  }

  return (
    <div id="form-booking" className="scroll-mt-24 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
        <CalendarDays className="h-5 w-5 text-red-600" /> {dict.booking.title}
      </h3>

      {/* Paket */}
      <p className={`${labelClass} mt-5`}>{dict.booking.package}</p>
      <div className={`mt-2 grid gap-2 ${pilihan.length === 3 ? "grid-cols-3" : pilihan.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {pilihan.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pilihPaket(p)}
            aria-pressed={paket === p}
            className={`rounded-xl border px-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${
              paket === p
                ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20"
                : "border-slate-200 text-slate-600 hover:border-red-300 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {namaPaket[p]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-400">{catatanPaket[paket]}</p>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>{harian ? dict.booking.qtyDay : dict.booking.qtyTrip}</span>
            <input
              type="number"
              min={1}
              max={365}
              value={jumlahTeks}
              onChange={(e) => setJumlahTeks(e.target.value)}
              onBlur={() => setJumlahTeks(String(jumlah))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>{dict.booking.startDate}</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>{paket === "self_drive" ? dict.area.deliveryLabel : dict.area.label}</span>
          <select
            value={String(area)}
            onChange={(e) => setArea(e.target.value === "pool" ? "pool" : (Number(e.target.value) as PilihanArea))}
            className={inputClass}
          >
            {pilihanArea.map((a) => (
              <option key={String(a)} value={String(a)}>{labelArea(a)}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>{dict.booking.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.booking.namePlaceholder} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>{dict.booking.phone}</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={dict.booking.phonePlaceholder} inputMode="tel" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>{dict.booking.note}</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={dict.booking.notePlaceholder} rows={2} className={inputClass} />
        </label>
      </div>

      {/* Rincian */}
      <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-5 text-sm dark:bg-slate-800/60">
        <div className="flex justify-between gap-3 font-medium text-slate-500 dark:text-slate-400">
          <span>{dict.booking.rental} {formatRupiah(hasil.tarif)} × {hasil.jumlah} {satuan}</span>
          <AnimatedNumber value={hasil.sewa} format={formatRupiah} className="shrink-0" />
        </div>
        {hasil.jenisTambahan !== null && !hasil.dikonfirmasi && area !== "pool" && (
          <div className="flex justify-between gap-3 font-medium text-slate-500 dark:text-slate-400">
            <span>
              {hasil.jenisTambahan === "area"
                ? `${fill(dict.area.areaFee, { n: area })} ${formatRupiah(hasil.tarifTambahan)} × ${hasil.jumlah}`
                : fill(dict.area.delivery, { n: area })}
            </span>
            <AnimatedNumber value={hasil.biayaTambahan} format={formatRupiah} className="shrink-0" />
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-black text-slate-900 dark:border-slate-700 dark:text-white">
          <span>{dict.booking.estTotal}</span>
          <AnimatedNumber value={hasil.total} format={formatRupiah} className="text-red-600" />
        </div>
        {hasil.dikonfirmasi && (
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {paket === "transfer" ? dict.area.transferNote : dict.booking.plusConfirmed}
          </p>
        )}
        {paket === "full_day" && adaHarga(car.price_overtime) && (
          <p className="text-[11px] text-slate-400">
            {dict.paket.overtime}: {formatRupiah(car.price_overtime)}{dict.paket.overtimeNote}
          </p>
        )}
        {paket === "self_drive" && (
          <p className="text-[11px] text-slate-400">
            {dict.paket.lateReturn}: {formatRupiah(TARIF_LEPAS_KUNCI.keterlambatanPerJam)}{dict.paket.lateReturnNote}
          </p>
        )}
        <p className="pt-1 text-[11px] text-slate-400">{dict.booking.finalPrice}</p>
      </div>

      {/* Termasuk / tidak termasuk */}
      <div key={paket} className="mt-5 grid animate-fade-in-up gap-4 text-xs sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <p className={labelClass}>{dict.booking.included}</p>
          <ul className="mt-2 space-y-1.5">
            {ringkasan.termasuk[locale].map((t) => (
              <li key={t} className="flex gap-2 text-slate-600 dark:text-slate-300">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={labelClass}>{dict.booking.excluded}</p>
          <ul className="mt-2 space-y-1.5">
            {ringkasan.tidakTermasuk[locale].map((t) => (
              <li key={t} className="flex gap-2 text-slate-500 dark:text-slate-400">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
      )}
      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 animate-pop" /> {dict.booking.success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={sending}
        className="kilau kilau-loop relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#25D366] px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-green-600/20 transition hover:-translate-y-0.5 hover:opacity-90 active:scale-95 disabled:opacity-60"
      >
        {sending ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> {dict.booking.processing}</>
        ) : (
          <><MessageCircle className="h-5 w-5" /> {dict.booking.submit}</>
        )}
      </button>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        {dict.booking.agreePrefix}{" "}
        <Link href="/syarat-ketentuan" className="font-bold text-slate-600 underline underline-offset-2 hover:text-red-600 dark:text-slate-300">
          {dict.booking.termsLink}
        </Link>
        .
      </p>
    </div>
  );
}
