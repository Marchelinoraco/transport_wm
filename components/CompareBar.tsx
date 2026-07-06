"use client";

import Image from "next/image";
import Link from "next/link";
import { X, GitCompareArrows, Trash2 } from "lucide-react";
import { useCompare } from "./CompareProvider";
import { useLang } from "@/lib/i18n/LanguageProvider";

export default function CompareBar() {
  const { items, remove, clear } = useCompare();
  const { dict } = useLang();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-[1.75rem] border border-slate-100 bg-white/95 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center gap-2 overflow-x-auto">
          {items.map((c) => (
            <div key={c.id} className="relative shrink-0">
              <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                {c.images[0] ? (
                  <Image src={c.images[0]} alt={c.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-[8px] text-slate-400 dark:bg-slate-800">
                    {c.name}
                  </div>
                )}
              </div>
              <button
                onClick={() => remove(c.id)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white shadow-lg shadow-red-600/30"
                aria-label="Hapus"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={i}
              className="hidden h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 text-[9px] text-slate-400 dark:border-slate-700 sm:flex"
            >
              —
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={clear}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />{" "}
            <span className="hidden sm:inline">{dict.compare.clearAll}</span>
          </button>
          <Link
            href="/banding"
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition ${
              items.length >= 2
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
                : "pointer-events-none bg-slate-100 text-slate-400 dark:bg-slate-800"
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />
            {dict.compare.title} ({items.length})
          </Link>
        </div>
      </div>
    </div>
  );
}
