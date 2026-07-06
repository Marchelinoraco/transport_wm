"use client";

import { waLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  const { dict } = useLang();

  return (
    <a
      href={waLink(dict.nav.waGreeting)}
      target="_blank"
      aria-label="Chat WhatsApp"
      className="group fixed bottom-24 right-5 z-40 flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-4 py-3 font-black text-white shadow-xl shadow-[#25D366]/30 transition hover:-translate-y-0.5 hover:scale-105 active:scale-95 sm:bottom-5"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75 motion-safe:animate-ping" />
        <MessageCircle className="relative h-6 w-6" />
      </span>
      <span className="hidden sm:flex sm:flex-col sm:leading-tight">
        <span className="text-sm">Chat WhatsApp</span>
        <span className="text-[10px] font-normal text-white/80">
          {dict.home.ctaBadge}
        </span>
      </span>
    </a>
  );
}
