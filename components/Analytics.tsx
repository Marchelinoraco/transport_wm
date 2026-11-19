"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_ID, apakahLinkWhatsapp, catatKlikWhatsapp } from "@/lib/analytics";

/**
 * Google Analytics 4 + penghitung klik WhatsApp. Tidak merender apa pun bila
 * NEXT_PUBLIC_GA_ID belum diisi di Vercel.
 *
 * Klik dihitung lewat satu pendengar di dokumen, bukan di tiap tombol: link
 * WhatsApp tersebar di belasan komponen (kartu mobil, footer, chat melayang,
 * form booking), dan link baru otomatis ikut terhitung tanpa perlu diingat.
 * Perpindahan halaman di dalam situs dicatat GA4 sendiri lewat "enhanced
 * measurement" (riwayat browser), yang aktif bawaan di properti GA4 baru.
 */
export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a");
      if (link && apakahLinkWhatsapp(link.getAttribute("href"))) {
        catatKlikWhatsapp(window.location.pathname);
      }
    };
    // capture: tetap tercatat walau komponen menghentikan propagasi klik
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
