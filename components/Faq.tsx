"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { dict } = useLang();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-3">
        {dict.faq.items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={`overflow-hidden rounded-2xl border transition ${
                isOpen
                  ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-900/10"
                  : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span
                  className={`text-sm font-black tracking-tight ${
                    isOpen
                      ? "text-red-600"
                      : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {f.q}
                </span>
                {isOpen ? (
                  <Minus className="h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                )}
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
