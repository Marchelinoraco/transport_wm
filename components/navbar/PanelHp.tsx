"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "../LanguageSwitcher";
import SakelarGelap from "./SakelarGelap";

/** Panel menu HP yang muncul dari bawah notch (gelap, senada notch). Tertutup saat Esc; pindah halaman ditangani Navbar. */
export default function PanelHp({ buka, onTutup }: { buka: boolean; onTutup: () => void }) {
  const { dict } = useLang();
  const pathname = usePathname();

  useEffect(() => {
    if (!buka) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onTutup();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [buka, onTutup]);

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/katalog", label: dict.nav.catalog },
    { href: "/promo", label: dict.nav.promo },
    { href: "/blog", label: dict.nav.blog },
    { href: "/tentang", label: dict.nav.about },
  ];
  const aktif = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tab = buka ? 0 : -1;

  return (
    <div
      aria-hidden={!buka}
      className={`pointer-events-auto mt-2 w-[calc(100%-24px)] max-w-sm origin-top rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.4)] transition duration-200 ease-out lg:hidden ${
        buka ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          tabIndex={tab}
          aria-current={aktif(l.href) ? "page" : undefined}
          className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition ${
            aktif(l.href) ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/[.06] hover:text-white"
          }`}
        >
          {l.label}
          {aktif(l.href) && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />}
        </Link>
      ))}
      <div className="my-2 h-px bg-white/10" />
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[13px] text-white/85">{dict.nav.language}</span>
        <LanguageSwitcher varian="notch" />
      </div>
      <SakelarGelap tabIndex={tab} />
      <Link href="/syarat-ketentuan" tabIndex={tab} className="block rounded-xl px-3 py-2.5 text-[13px] text-white/85 transition hover:bg-white/[.07]">
        {dict.nav.terms}
      </Link>
    </div>
  );
}
