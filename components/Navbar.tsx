"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { MAIN_SITE_URL } from "@/lib/site";
import { useLang } from "@/lib/i18n/LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import MenuLainnya from "./navbar/MenuLainnya";
import GarisKilau from "./navbar/GarisKilau";

/** Batas gulir: notch hitam hanya ketika halaman di paling atas. */
const BATAS_GULIR = 24;

export default function Navbar() {
  const [panelBuka, setPanelBuka] = useState(false);
  const [tergulir, setTergulir] = useState(false);
  const pathname = usePathname();
  const { dict } = useLang();
  const notchRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [sorot, setSorot] = useState<{ x: number; w: number; tampak: boolean }>({ x: 0, w: 0, tampak: false });
  const sorotKe = (el: HTMLElement) => setSorot({ x: el.offsetLeft, w: el.offsetWidth, tampak: true });

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/katalog", label: dict.nav.catalog },
    { href: "/promo", label: dict.nav.promo },
    { href: "/blog", label: dict.nav.blog },
    { href: "/tentang", label: dict.nav.about },
  ];
  const aktif = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    // Dihitung saat mount juga: halaman bisa dibuka sudah tergulir (muat ulang, tautan berjangkar).
    const cek = () => setTergulir(window.scrollY > BATAS_GULIR);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    return () => window.removeEventListener("scroll", cek);
  }, []);

  useEffect(() => setPanelBuka(false), [pathname]);

  // Panel HP terbuka: notch tetap hitam meski halaman tergulir.
  const keadaan = tergulir && !panelBuka ? "kaca" : "hitam";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center">
      <nav ref={notchRef} data-keadaan={keadaan} className="notch notch-masuk pointer-events-auto">
        <GarisKilau target={notchRef} />
        <Link href="/" className="notch-isi group flex items-center gap-2.5" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="transition-transform duration-500 group-hover:-rotate-[8deg] group-hover:scale-105">
            <Logo size={32} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="notch-wordmark whitespace-nowrap text-[14.5px] font-black tracking-tight">
              Welcome<span className="text-red-500">Manado</span>
            </span>
            <span className="notch-tag mt-1 text-[8px] font-extrabold uppercase tracking-[0.38em] max-[399px]:hidden">
              {dict.nav.tagline}
            </span>
          </span>
        </Link>

        <div
          ref={menuRef}
          onMouseLeave={() => setSorot((s) => ({ ...s, tampak: false }))}
          className="notch-menu relative hidden items-center gap-0.5 lg:flex"
        >
          <span
            aria-hidden
            className="notch-sorot"
            style={{ width: sorot.w, transform: `translateX(${sorot.x}px)`, opacity: sorot.tampak ? 1 : 0 }}
          />
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={aktif(l.href) ? "page" : undefined}
              onMouseEnter={(e) => sorotKe(e.currentTarget)}
              onFocus={(e) => sorotKe(e.currentTarget)}
              style={{ "--i": i + 1 } as React.CSSProperties}
              className="notch-isi relative z-[1] whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] font-semibold"
            >
              {l.label}
              {aktif(l.href) && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="notch-isi hidden lg:block" style={{ "--i": 6 } as React.CSSProperties}>
            <LanguageSwitcher varian="notch" />
          </div>
          <div className="notch-isi hidden lg:block" style={{ "--i": 7 } as React.CSSProperties}>
            <MenuLainnya />
          </div>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ "--i": 8 } as React.CSSProperties}
            className="notch-isi notch-cta kilau kilau-loop group/cta relative flex items-center overflow-hidden gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12.5px] font-extrabold hover:-translate-y-px lg:px-4 lg:py-2.5 lg:text-[13px]"
          >
            {dict.nav.mainSite}
            <ArrowUpRight className="h-3.5 w-3.5 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </a>
          <button
            type="button"
            onClick={() => setPanelBuka((v) => !v)}
            aria-label={dict.nav.menu}
            aria-expanded={panelBuka}
            className="notch-bulat grid h-[34px] w-[34px] place-items-center rounded-full lg:hidden"
          >
            {panelBuka ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Panel HP sementara — diganti PanelHp (Task 5). */}
      {panelBuka && (
        <div className="pointer-events-auto mt-2 w-[calc(100%-24px)] max-w-sm rounded-2xl bg-white p-3 shadow-xl dark:bg-slate-900 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
