"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { locales, localeMeta, type Locale } from "@/lib/i18n/dictionaries";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Ganti bahasa"
        className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900/60 dark:hover:text-red-400"
      >
        <Languages className="h-4 w-4" />
        {localeMeta[locale].short}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-[1.75rem] border border-slate-100 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:border-slate-700 dark:bg-slate-900">
          {locales.map((l: Locale) => {
            const active = l === locale;
            return (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                  active
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-lg leading-none">{localeMeta[l].flag}</span>
                <span className="flex-1">{localeMeta[l].name}</span>
                {active && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
