"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import {
  useChatWidget,
  salinTeks,
  WECHAT_ID,
  WECHAT_ICON_PATH,
  KAKAO_ID,
  KAKAO_PHONE,
  KAKAO_EMAIL,
  KAKAO_ICON_PATH,
} from "@/lib/chatWidget";

/** Tombol "tersalin!" yang kembali sendiri setelah 2 detik. */
function useSalin() {
  const [tersalin, setTersalin] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const salin = async (teks: string) => {
    await salinTeks(teks);
    setTersalin(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTersalin(false), 2000);
  };

  return { tersalin, salin };
}

export default function FloatingChat() {
  const { dict } = useLang();
  const {
    menuOpen,
    wechatOpen,
    kakaoOpen,
    toggleMenu,
    closeMenu,
    setWechatOpen,
    setKakaoOpen,
  } = useChatWidget();

  const wechat = useSalin();
  const kakao = useSalin();

  return (
    // bottom-24 di layar kecil mengikuti jarak yang dipakai tombol WhatsApp
    // sebelumnya, supaya tidak menutupi CompareBar yang melintang di bawah.
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-4 sm:bottom-6">
      {/* Kartu WeChat */}
      {wechatOpen && (
        <div className="relative w-64 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl">
          <button
            onClick={() => setWechatOpen(false)}
            aria-label={dict.chat.wechat.close}
            className="absolute right-3 top-3 text-slate-400 transition-colors hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {dict.chat.wechat.title}
          </p>
          <Image
            src="/wechat-qr.png"
            alt={dict.chat.wechat.scan}
            width={160}
            height={160}
            className="mx-auto h-40 w-40 rounded-2xl border border-slate-100"
          />
          <p className="mt-4 text-xs font-medium text-slate-500">
            {dict.chat.wechat.scan}
          </p>
          <p className="mt-3 text-xl font-black tracking-tight text-slate-900">
            {WECHAT_ID}
          </p>
          <p className="mb-5 mt-1 text-xs font-medium text-slate-500">
            {dict.chat.wechat.description}
          </p>
          <button
            onClick={() => wechat.salin(WECHAT_ID)}
            className="w-full rounded-2xl bg-[#07C160] py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#06AD56] active:scale-95"
          >
            {wechat.tersalin ? dict.chat.wechat.copied : dict.chat.wechat.copy}
          </button>
        </div>
      )}

      {/* Kartu KakaoTalk */}
      {kakaoOpen && (
        <div className="relative w-64 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl">
          <button
            onClick={() => setKakaoOpen(false)}
            aria-label={dict.chat.kakao.close}
            className="absolute right-3 top-3 text-slate-400 transition-colors hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {dict.chat.kakao.title}
          </p>
          <Image
            src="/kakao-qr.png"
            alt={dict.chat.kakao.scan}
            width={160}
            height={160}
            className="mx-auto h-40 w-40 rounded-2xl border border-slate-100"
          />
          <p className="mt-4 text-xs font-medium text-slate-500">
            {dict.chat.kakao.scan}
          </p>
          <p className="mt-3 text-xl font-black tracking-tight text-slate-900">
            {KAKAO_ID}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-600">{KAKAO_PHONE}</p>
          <p className="mb-1 mt-1 break-all text-xs font-medium text-slate-500">
            {KAKAO_EMAIL}
          </p>
          <p className="mb-5 text-xs font-medium text-slate-500">
            {dict.chat.kakao.description}
          </p>
          <button
            onClick={() => kakao.salin(KAKAO_PHONE)}
            className="w-full rounded-2xl bg-[#FEE500] py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-[#FDD800] active:scale-95"
          >
            {kakao.tersalin ? dict.chat.kakao.copied : dict.chat.kakao.copy}
          </button>
        </div>
      )}

      {/* Pilihan kanal */}
      {menuOpen && (
        <div className="flex flex-col items-end gap-3">
          <a
            href={waLink(dict.nav.waGreeting)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="group flex items-center gap-3"
          >
            <span className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
              WhatsApp
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform duration-300 group-hover:scale-110">
              <MessageCircle className="h-7 w-7" />
            </span>
          </a>

          <button
            onClick={() => {
              setKakaoOpen(false);
              setWechatOpen(!wechatOpen);
            }}
            className="group flex items-center gap-3"
          >
            <span className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
              {dict.chat.wechat.title}
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#07C160] text-white shadow-xl transition-transform duration-300 group-hover:scale-110">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d={WECHAT_ICON_PATH} />
              </svg>
            </span>
          </button>

          <button
            onClick={() => {
              setWechatOpen(false);
              setKakaoOpen(!kakaoOpen);
            }}
            className="group flex items-center gap-3"
          >
            <span className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
              {dict.chat.kakao.title}
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEE500] text-slate-900 shadow-xl transition-transform duration-300 group-hover:scale-110">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d={KAKAO_ICON_PATH} />
              </svg>
            </span>
          </button>
        </div>
      )}

      {/* Tombol utama */}
      <button
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        title={dict.chat.menuTitle}
        className="group flex items-center gap-3"
      >
        {!menuOpen && (
          <span className="hidden whitespace-nowrap rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg sm:inline">
            {dict.chat.menuTitle}
          </span>
        )}
        <span
          className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/40 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-700 group-active:scale-95 ${
            menuOpen ? "" : "motion-safe:animate-bounce-slow"
          }`}
        >
          {menuOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <>
              <MessageCircle className="h-8 w-8" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-white bg-red-600" />
              </span>
            </>
          )}
        </span>
      </button>
    </div>
  );
}
