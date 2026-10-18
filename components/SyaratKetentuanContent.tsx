"use client";

import { MessageCircle } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { fill, formatTanggal } from "@/lib/i18n/format";
import { SYARAT_KETENTUAN, SYARAT_BERLAKU_SEJAK } from "@/lib/syarat-ketentuan";
import { waLink } from "@/lib/whatsapp";

/**
 * Dua kolom: isi di kiri, daftar isi yang ikut menggulir di kanan (di layar
 * besar ditampilkan di kiri lewat lg:order-first). Daftar isi ditaruh SESUDAH
 * isi di markup supaya pembaca layar sampai ke naskahnya lebih dulu.
 */
export default function SyaratKetentuanContent() {
  const { dict, locale } = useLang();
  const berlaku = formatTanggal(SYARAT_BERLAKU_SEJAK, locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-3xl space-y-2 border-b border-slate-200 pb-8 dark:border-slate-800">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">{dict.terms.title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{dict.terms.subtitle}</p>
        <p className="text-sm text-slate-400">{fill(dict.terms.effectiveSince, { date: berlaku })}</p>
      </header>

      <div className="flex flex-col gap-10 pt-10 lg:flex-row lg:items-start lg:gap-14">
        <div className="min-w-0 flex-1 space-y-10">
          {SYARAT_KETENTUAN.map((bagian, i) => (
            <section key={bagian.id} id={bagian.id} className="scroll-mt-24">
              <h2 className="mb-4 flex gap-3 text-xl font-bold text-slate-900 dark:text-white">
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-50 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {i + 1}
                </span>
                <span className="pt-0.5">{bagian.judul[locale]}</span>
              </h2>
              <ul className="space-y-3 border-l border-slate-200 pl-6 dark:border-slate-800 sm:ml-4">
                {bagian.isi[locale].map((butir, j) => (
                  <li key={j} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{butir}</li>
                ))}
              </ul>
            </section>
          ))}

          <div className="rounded-[2rem] bg-slate-50 p-6 dark:bg-slate-800/60">
            <p className="font-bold text-slate-900 dark:text-white">{dict.terms.askTitle}</p>
            <a
              href={waLink(dict.terms.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-red-700"
            >
              <MessageCircle className="h-4 w-4" /> {dict.terms.askWa}
            </a>
          </div>
        </div>

        <nav aria-label={dict.terms.toc} className="lg:sticky lg:top-24 lg:order-first lg:w-64 lg:shrink-0">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.terms.toc}</p>
          <ol className="space-y-2 text-sm">
            {SYARAT_KETENTUAN.map((bagian, i) => (
              <li key={bagian.id}>
                <a href={`#${bagian.id}`} className="text-slate-600 transition hover:text-red-600 dark:text-slate-400">
                  {i + 1}. {bagian.judul[locale]}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
