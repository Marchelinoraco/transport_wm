"use client";

import { useLang } from "@/lib/i18n/LanguageProvider";
import { useTheme } from "@/components/ThemeProvider";

/** Baris "Mode gelap" + sakelar, dipakai di menu "⋯" dan panel HP. */
export default function SakelarGelap({ tabIndex }: { tabIndex?: number }) {
  const { dict } = useLang();
  const { theme, toggle } = useTheme();
  const gelap = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={gelap}
      tabIndex={tabIndex}
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] text-white/85 transition hover:bg-white/[.07]"
    >
      {dict.nav.darkMode}
      <span className={`relative h-[17px] w-[30px] rounded-full transition ${gelap ? "bg-red-600" : "bg-white/20"}`}>
        <span className={`absolute top-[2px] h-[13px] w-[13px] rounded-full bg-white transition-all ${gelap ? "left-[15px]" : "left-[2px]"}`} />
      </span>
    </button>
  );
}
