"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Ban, CalendarCheck, CheckCircle2, Car, Clock, FileText, Fuel, KeyRound, Lock, Map, MapPin,
  MessageCircle, Scale, ShieldCheck, Tag, Undo2, User, Wrench,
} from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill, formatTanggal } from "@/lib/i18n/format";
import { SYARAT_KETENTUAN, SYARAT_BERLAKU_SEJAK } from "@/lib/syarat-ketentuan";
import { IKON_PASAL, RINGKASAN_SYARAT, type NamaIkon } from "@/lib/syarat-ringkasan";
import { waLink } from "@/lib/whatsapp";

type Ikon = ComponentType<{ className?: string }>;
const IKON: Record<NamaIkon, Ikon> = {
  user: User, calendar: CalendarCheck, tag: Tag, shield: ShieldCheck, key: KeyRound, fuel: Fuel, map: Map,
  clock: Clock, ban: Ban, wrench: Wrench, undo: Undo2, steering: Car, pin: MapPin, lock: Lock, scale: Scale,
};

/**
 * Halaman S&K: banner + "rangkuman cepat" (5 hal yang paling sering ditanyakan), lalu 15 pasal lengkap sebagai kartu.
 * Daftar isi menandai pasal yang sedang dibaca (lg: di kiri & menempel; ponsel: deretan chip yang menempel di atas).
 * Daftar isi ditaruh SESUDAH isi di markup supaya pembaca layar sampai ke naskahnya lebih dulu.
 * Isi pasal TIDAK diubah di sini — sumbernya lib/syarat-ketentuan.ts.
 */
export default function SyaratKetentuanContent() {
  const { dict, locale } = useLang();
  const berlaku = formatTanggal(SYARAT_BERLAKU_SEJAK, locale);
  const [aktif, setAktif] = useState<string>(SYARAT_KETENTUAN[0].id);

  useEffect(() => {
    const els = SYARAT_KETENTUAN.map((b) => document.getElementById(b.id)).filter((e): e is HTMLElement => !!e);
    if (!("IntersectionObserver" in window) || !els.length) return;
    // Pasal "aktif" = yang paling atas di dalam pita sepertiga bagian atas layar.
    const pengamat = new IntersectionObserver(
      (entri) => {
        const terlihat = entri.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (terlihat[0]) setAktif(terlihat[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    els.forEach((e) => pengamat.observe(e));
    return () => pengamat.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* Banner */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-10 text-white shadow-2xl sm:px-10 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-red-600/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">
            <FileText className="h-3.5 w-3.5 text-red-400" /> {dict.terms.eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{dict.terms.title}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">{dict.terms.subtitle}</p>
          <p className="mt-5 inline-flex rounded-full bg-red-600/90 px-4 py-1.5 text-xs font-bold text-white">
            {fill(dict.terms.effectiveSince, { date: berlaku })}
          </p>
        </div>
      </header>

      {/* Rangkuman cepat */}
      <section aria-labelledby="rangkuman" className="mt-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="rangkuman" className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{dict.terms.quickTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{dict.terms.quickNote}</p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RINGKASAN_SYARAT.map((r) => {
            const Ikon = IKON[r.ikon];
            return (
              <li key={r.pasal}>
                <a
                  href={`#${r.pasal}`}
                  className="group flex h-full flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-500/60"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white dark:bg-red-900/30 dark:text-red-300">
                    <Ikon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.judul[locale]}</span>
                  <span className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{r.nilai[locale]}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 flex-1 space-y-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{dict.terms.fullClauses}</h2>
          {SYARAT_KETENTUAN.map((bagian, i) => {
            const Ikon = IKON[IKON_PASAL[bagian.id]];
            return (
              <section
                key={bagian.id}
                id={bagian.id}
                className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-shadow target:border-red-300 target:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:target:border-red-500/60 sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-600/30">
                    <Ikon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                      {dict.terms.clause} {i + 1}
                    </p>
                    <h3 className="text-lg font-black leading-tight text-slate-900 dark:text-white sm:text-xl">{bagian.judul[locale]}</h3>
                  </div>
                </div>
                <ul className="mt-5 space-y-3">
                  {bagian.isi[locale].map((butir, j) => (
                    <li key={j} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <span>{butir}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-red-600/40 blur-3xl" />
            <p className="relative text-lg font-black">{dict.terms.askTitle}</p>
            <p className="relative mt-1 text-sm text-slate-300">{dict.terms.scope}</p>
            <a
              href={waLink(dict.terms.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-500"
            >
              <MessageCircle className="h-4 w-4" /> {dict.terms.askWa}
            </a>
          </div>
        </div>

        <nav aria-label={dict.terms.toc} className="sticky top-20 z-20 -mx-4 lg:order-first lg:top-24 lg:mx-0 lg:w-64 lg:shrink-0">
          <p className="mb-3 hidden text-[10px] font-black uppercase tracking-widest text-slate-400 lg:block">{dict.terms.toc}</p>
          <ol className="flex gap-2 overflow-x-auto bg-white/90 px-4 py-2 backdrop-blur dark:bg-slate-950/90 lg:block lg:space-y-1 lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:dark:bg-transparent">
            {SYARAT_KETENTUAN.map((bagian, i) => {
              const on = aktif === bagian.id;
              return (
                <li key={bagian.id} className="shrink-0">
                  <a
                    href={`#${bagian.id}`}
                    aria-current={on ? "true" : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition lg:whitespace-normal lg:rounded-xl lg:py-2 lg:text-sm ${
                      on
                        ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                        : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:bg-transparent lg:dark:bg-transparent"
                    }`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${on ? "bg-white/25" : "bg-white text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}>{i + 1}</span>
                    {bagian.judul[locale]}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
