"use client";

import { useEffect, useState } from "react";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { useCompare } from "./CompareProvider";
import { formatRupiah } from "@/lib/whatsapp";
import { hargaPaket, paketTersedia } from "@/lib/paket";

/**
 * Di HP/tablet kartu harga dan form booking berada di bawah galeri & deskripsi.
 * Bar ini menemani pengunjung selama mereka membaca bagian atas: tampil setelah
 * halaman digulir, dan hilang selama kartu harga atau form sedang terlihat
 * (keduanya sudah memuat harga dan tombol booking). Tidak tampil bila
 * CompareBar sedang terbuka (keduanya menempel di bawah).
 */
export default function StickyBookingBar({ car }: { car: Car }) {
  const { dict } = useLang();
  const { items } = useCompare();
  const [sudahGulir, setSudahGulir] = useState(false);
  const [kartuTerlihat, setKartuTerlihat] = useState(false);
  const [formTerlihat, setFormTerlihat] = useState(false);

  useEffect(() => {
    const kartu = document.getElementById("kartu-harga");
    const form = document.getElementById("form-booking");
    if (!kartu || !form) return;
    const obsKartu = new IntersectionObserver(([e]) => setKartuTerlihat(e.isIntersecting));
    const obsForm = new IntersectionObserver(([e]) => setFormTerlihat(e.isIntersecting), { threshold: 0.1 });
    const onScroll = () => setSudahGulir(window.scrollY > 160);
    obsKartu.observe(kartu);
    obsForm.observe(form);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obsKartu.disconnect();
      obsForm.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const pilihan = paketTersedia(car);
  const tampil = sudahGulir && !kartuTerlihat && !formTerlihat && items.length === 0 && pilihan.length > 0;

  useEffect(() => {
    const root = document.documentElement;
    if (tampil) root.dataset.stickyBooking = "1";
    else delete root.dataset.stickyBooking;
    return () => {
      delete root.dataset.stickyBooking;
    };
  }, [tampil]);

  const paketUtama = pilihan[0] ?? "full_day";
  const harga = hargaPaket(car, paketUtama);

  function keForm() {
    const gerakMinimal = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("form-booking")?.scrollIntoView({ behavior: gerakMinimal ? "auto" : "smooth", block: "start" });
  }

  return (
    <div
      aria-hidden={!tampil}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-transform duration-500 ease-out lg:hidden ${
        tampil ? "translate-y-0" : "pointer-events-none translate-y-[120%]"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-[1.75rem] border border-slate-100 bg-white/95 p-3 pl-4 shadow-2xl shadow-slate-900/10 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">{car.name}</p>
          <p className="whitespace-nowrap text-base font-black text-red-600">
            {harga !== null ? formatRupiah(harga) : dict.paket.askPrice}
            {harga !== null && (
              <span className="text-xs font-bold text-slate-400">
                {paketUtama === "transfer" ? dict.paket.perTrip : dict.paket.perDay}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          tabIndex={tampil ? 0 : -1}
          onClick={keForm}
          className="kilau kilau-loop relative shrink-0 overflow-hidden rounded-2xl bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/30 transition active:scale-95"
        >
          {dict.booking.stickyCta}
        </button>
      </div>
    </div>
  );
}
