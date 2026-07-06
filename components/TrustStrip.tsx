"use client";

import { ShieldCheck, Zap, Tag, Camera } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageProvider";

const icons = [ShieldCheck, Zap, Tag, Camera];

export default function TrustStrip({ compact = false }: { compact?: boolean }) {
  const { dict } = useLang();

  return (
    <div
      className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}
    >
      {dict.trust.items.map((it, i) => {
        const Icon = icons[i];
        return (
          <div
            key={it.title}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 dark:bg-red-900/20">
              <Icon className="h-5 w-5 text-red-600" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                {it.title}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {it.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
