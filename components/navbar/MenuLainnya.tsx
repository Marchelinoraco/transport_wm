"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import SakelarGelap from "./SakelarGelap";

/**
 * Tombol "⋯" di notch: mode gelap dan Syarat & Ketentuan. Tertutup saat klik
 * di luar, Esc, atau halaman digulir (menu kecil yang melayang tanpa notch di
 * bawahnya terlihat janggal setelah notch berubah menjadi kaca).
 */
export default function MenuLainnya() {
  const { dict } = useLang();
  const [buka, setBuka] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buka) return;
    const tutup = () => setBuka(false);
    const luar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) tutup();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && tutup();
    document.addEventListener("mousedown", luar);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", tutup, { passive: true });
    return () => {
      document.removeEventListener("mousedown", luar);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", tutup);
    };
  }, [buka]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label={dict.nav.more}
        aria-expanded={buka}
        className="notch-bulat grid h-[34px] w-[34px] place-items-center rounded-full"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right rounded-2xl border border-white/10 bg-[#111] p-1.5 text-white shadow-[0_18px_40px_rgba(0,0,0,0.4)] transition duration-200 ease-out ${
          buka ? "scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <SakelarGelap tabIndex={buka ? 0 : -1} />
        <Link
          href="/syarat-ketentuan"
          tabIndex={buka ? 0 : -1}
          onClick={() => setBuka(false)}
          className="block rounded-xl px-3 py-2.5 text-[13px] text-white/85 transition hover:bg-white/[.07]"
        >
          {dict.nav.terms}
        </Link>
      </div>
    </div>
  );
}
