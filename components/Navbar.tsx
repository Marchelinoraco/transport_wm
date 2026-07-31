"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, MessageCircle, ArrowUpRight } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { MAIN_SITE_URL } from "@/lib/site";
import { useLang } from "@/lib/i18n/LanguageProvider";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { dict } = useLang();

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/katalog", label: dict.nav.catalog },
    { href: "/promo", label: dict.nav.promo },
    { href: "/blog", label: dict.nav.blog },
    { href: "/tentang", label: dict.nav.about },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-100 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.03)] backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        {/* Brand — tile logo + wordmark gaya client_wm */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="transition-transform duration-500 group-hover:rotate-[15deg]">
            <Logo size={44} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white lg:text-xl">
              Welcome<span className="text-red-600">Manado</span>
            </span>
            <span className="mt-1 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 opacity-70 dark:text-slate-400">
              {dict.nav.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative text-xs font-black uppercase tracking-widest transition-colors ${
                  isActive
                    ? "text-red-600"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-red-600 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <LanguageSwitcher />
          <ThemeToggle />

          {/* Sengaja sekunder (bergaris, bukan solid merah): merah milik tombol
              WhatsApp yang jadi jalur konversi utama. Dua tombol solid bersaing. */}
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:border-red-600 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-500 dark:hover:text-red-500"
          >
            {dict.nav.mainSite}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          <a
            href={waLink(dict.nav.waGreeting)}
            target="_blank"
            className="rounded-xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-red-600/30 active:scale-95"
          >
            {dict.nav.contact}
          </a>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href={waLink(dict.nav.waGreeting)}
            target="_blank"
            aria-label={dict.nav.contact}
            className="rounded-xl bg-red-600 p-2.5 text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition ${
                  pathname === l.href
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-300 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              {dict.nav.mainSite}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={waLink(dict.nav.waGreeting)}
              target="_blank"
              className="mt-1 rounded-2xl bg-red-600 px-5 py-3.5 text-center text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20"
            >
              {dict.nav.contact}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
