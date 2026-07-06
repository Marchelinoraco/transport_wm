"use client";

import { useMemo, useState } from "react";
import { Car } from "@/lib/types";
import { formatRupiah, openWhatsApp } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageCircle,
  UserCheck,
} from "lucide-react";

type Mode = "hari" | "minggu" | "bulan";

const config: Record<Mode, { days: number; discount: number }> = {
  hari:   { days: 1,  discount: 0 },
  minggu: { days: 7,  discount: 0.1 },
  bulan:  { days: 30, discount: 0.2 },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export default function BookingForm({ car }: { car: Car }) {
  const { dict } = useLang();
  const perTrip = car.price_unit === "per_trip";

  const [mode, setMode] = useState<Mode>("hari");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const rate = car.price_rent ?? 0;
  const { days, discount } = perTrip ? { days: 0, discount: 0 } : config[mode];
  const totalDays = perTrip ? 0 : days * qty;

  const { subtotal, potongan, total, endDate } = useMemo(() => {
    const units = perTrip ? qty : totalDays;
    const subtotal = rate * units;
    const potongan = Math.round(subtotal * discount);
    const total = subtotal - potongan;
    let endDate = "";
    if (!perTrip && startDate && totalDays > 1) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + totalDays - 1);
      endDate = d.toISOString().slice(0, 10);
    }
    return { subtotal, potongan, total, endDate };
  }, [rate, totalDays, discount, startDate, perTrip, qty]);

  const modeLabels: Record<Mode, string> = {
    hari: dict.booking.modeDay,
    minggu: dict.booking.modeWeek,
    bulan: dict.booking.modeMonth,
  };
  const qtyLabel = perTrip
    ? dict.booking.qtyTrip
    : mode === "hari"
      ? dict.booking.qtyDay
      : mode === "minggu"
        ? dict.booking.qtyWeek
        : dict.booking.qtyMonth;

  const durasiLabel = perTrip
    ? `${qty} ${dict.booking.trip}`
    : `${totalDays} ${dict.booking.days} (${modeLabels[mode]})`;

  const message =
`🚗 *BOOKING — WELCOME MANADO TRANSPORT*

👤 Nama       : ${name || "-"}
📱 No. WA     : ${phone || "-"}
🚙 Mobil      : ${car.name}${car.year ? ` (${car.year})` : ""}
🏷️ Tipe       : ${[car.type, car.transmission, car.fuel].filter(Boolean).join(" | ") || "-"}
📅 Tanggal    : ${startDate || "-"}${endDate ? ` s/d ${endDate}` : ""}
⏱️ Durasi      : ${durasiLabel}
🧑‍✈️ Dengan Sopir: ${withDriver ? "Ya" : "Tidak"}
💵 Est. Total  : ${formatRupiah(total)}${potongan > 0 ? ` (sudah diskon ${Math.round(discount * 100)}%)` : ""}
📝 Catatan     : ${note || "-"}

Mohon konfirmasi ketersediaan & harga final. Terima kasih! 🙏`;

  async function handleSubmit() {
    setError("");
    if (!name.trim()) { setError(dict.booking.errName); return; }
    if (!phone.trim()) { setError(dict.booking.errPhone); return; }
    if (!startDate) { setError(dict.booking.errDate); return; }

    setSending(true);
    let ok = false;
    try {
      const res = await fetch(`${API_BASE}/transportation-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          transportation_id: car.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          booking_date: startDate,
          end_date: endDate || null,
          duration_days: perTrip ? null : totalDays,
          dengan_sopir: withDriver,
          total_price: total,
          notes: [perTrip ? `Booking ${qty} trip` : null, note.trim() || null]
            .filter(Boolean)
            .join(" — ") || null,
        }),
      });
      ok = res.ok;
    } catch {
      // Booking gagal tersimpan bukan alasan kehilangan lead — tetap lanjut ke WhatsApp
    }

    setSending(false);
    if (ok) {
      // Konfirmasi singkat sebelum membuka WhatsApp
      setSaved(true);
      setTimeout(() => {
        openWhatsApp(message);
        setSaved(false);
      }, 1200);
    } else {
      openWhatsApp(message);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-2xl border-none bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600/20 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800";
  const labelClass =
    "block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400";

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
        <CalendarDays className="h-5 w-5 text-red-600" /> {dict.booking.title}
      </h3>

      {/* Pilih durasi — hanya untuk sewa harian */}
      {!perTrip && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {(Object.keys(config) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl border px-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${
                mode === m
                  ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "border-slate-200 text-slate-600 hover:border-red-300 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {modeLabels[m]}
              {m !== "hari" && (
                <span className={`ml-1 ${mode === m ? "text-white/80" : "text-green-600 dark:text-green-400"}`}>
                  {m === "minggu" ? "-10%" : "-20%"}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={labelClass}>{dict.booking.name} *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.booking.namePlaceholder}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>{dict.booking.phone} *</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={dict.booking.phonePlaceholder}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>{dict.booking.startDate} *</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>{qtyLabel}</span>
            <input
              type="number"
              min={1}
              max={90}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className={inputClass}
            />
          </label>
        </div>

        {car.dengan_sopir && (
          <button
            type="button"
            onClick={() => setWithDriver((v) => !v)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition ${
              withDriver
                ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "border-slate-200 text-slate-600 hover:border-red-200 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>{withDriver ? dict.booking.driverSelected : dict.booking.addDriver}</span>
          </button>
        )}

        <label className="block">
          <span className={labelClass}>{dict.booking.note}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={dict.booking.notePlaceholder}
            className={inputClass}
          />
        </label>
      </div>

      {/* Ringkasan harga */}
      <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-5 text-sm dark:bg-slate-800/60">
        <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
          <span>
            {formatRupiah(rate)} × {perTrip ? `${qty} ${dict.booking.trip}` : `${totalDays} ${dict.booking.days}`}
          </span>
          <span>{formatRupiah(subtotal)}</span>
        </div>
        {potongan > 0 && (
          <div className="flex justify-between font-bold text-green-600 dark:text-green-400">
            <span>{dict.booking.discount} {Math.round(discount * 100)}%</span>
            <span>− {formatRupiah(potongan)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-black text-slate-900 dark:border-slate-700 dark:text-white">
          <span>{dict.booking.estTotal}</span>
          <span className="text-red-600">{formatRupiah(total)}</span>
        </div>
        <p className="pt-1 text-[11px] text-slate-400">{dict.booking.finalPrice}</p>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {dict.booking.success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={sending || saved}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-green-600/20 transition hover:-translate-y-0.5 hover:opacity-90 active:scale-95 disabled:opacity-60"
      >
        {sending ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> {dict.booking.processing}</>
        ) : (
          <><MessageCircle className="h-5 w-5" /> {dict.booking.submit}</>
        )}
      </button>
    </div>
  );
}
