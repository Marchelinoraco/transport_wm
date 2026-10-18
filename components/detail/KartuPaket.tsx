"use client";

import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { type Paket, hargaPaket, paketTersedia } from "@/lib/paket";
import { formatRupiah } from "@/lib/whatsapp";

/**
 * Kartu paket yang bisa dipilih. Pembungkusnya ber-id "kartu-harga" karena
 * StickyBookingBar menyembunyikan dirinya selama elemen itu terlihat.
 */
export default function KartuPaket({ car, paket, onPilih }: { car: Car; paket: Paket; onPilih: (p: Paket) => void }) {
  const { dict } = useLang();
  const pilihan = paketTersedia(car);
  const catatan: Record<Paket, string> = {
    full_day: dict.paket.full_dayNote,
    transfer: dict.paket.transferNote,
    self_drive: dict.paket.self_driveNote,
  };
  const kolom = pilihan.length === 3 ? "sm:grid-cols-3" : pilihan.length === 2 ? "sm:grid-cols-2" : "";

  return (
    <div id="kartu-harga">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.detail.choosePackage}</p>
      <div role="radiogroup" aria-label={dict.detail.choosePackage} className={`grid gap-3 ${kolom}`}>
        {pilihan.map((p) => {
          const dipilih = p === paket;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={dipilih}
              onClick={() => onPilih(p)}
              className={`rounded-[1.5rem] border-2 bg-white p-5 text-left transition duration-300 hover:-translate-y-0.5 dark:bg-slate-900 ${
                dipilih
                  ? "-translate-y-0.5 border-red-600 shadow-xl shadow-red-600/10"
                  : "border-slate-100 hover:border-red-200 dark:border-slate-800"
              }`}
            >
              <span className="block text-sm font-black text-slate-900 dark:text-white">{dict.paket[p]}</span>
              <span className="mt-1 block text-xl font-black tracking-tight text-red-600">
                {formatRupiah(hargaPaket(car, p))}
                <span className="text-xs font-bold text-slate-400">{p === "transfer" ? dict.paket.perTrip : dict.paket.perDay}</span>
              </span>
              <span className="mt-1 block text-xs text-slate-400">{catatan[p]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
