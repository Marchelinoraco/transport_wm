"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Padanan React dari client_wm/src/composables/chatWidget.js — nilai-nilainya
// disalin apa adanya supaya ID yang dilihat customer sama di kedua situs.
export const WECHAT_ID = "WelcomeManado";
export const WECHAT_ICON_PATH =
  "M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-2.34 7.621-.55-.302-4.023-4.115-6.63-8.365-6.63zm-2.792 2.35a1.166 1.166 0 0 1 1.17 1.17c0 .646-.523 1.17-1.17 1.17a1.166 1.166 0 0 1-1.17-1.17c0-.646.523-1.17 1.17-1.17zm5.783 0a1.166 1.166 0 0 1 1.17 1.17c0 .646-.523 1.17-1.17 1.17a1.166 1.166 0 0 1-1.17-1.17c0-.646.524-1.17 1.17-1.17zm5.61 5.153c-3.907 0-7.076 2.653-7.076 5.925 0 3.271 3.17 5.925 7.077 5.925.808 0 1.588-.115 2.31-.325a.7.7 0 0 1 .58.08l1.543.904a.264.264 0 0 0 .136.043c.13 0 .234-.107.234-.238 0-.058-.023-.116-.038-.174l-.317-1.201a.472.472 0 0 1 .171-.535c1.485-1.09 2.436-2.707 2.436-4.48 0-3.271-3.17-5.924-7.076-5.924zm-2.34 3.16a.943.943 0 0 1 .943.944.943.943 0 0 1-.944.943.943.943 0 0 1-.943-.943.943.943 0 0 1 .943-.944zm4.681 0a.943.943 0 0 1 .944.944.943.943 0 0 1-.944.943.943.943 0 0 1-.943-.943.943.943 0 0 1 .943-.944z";

export const KAKAO_ID = "Welcome Manado";
export const KAKAO_PHONE = "+62-821-7373-8822";
export const KAKAO_EMAIL = "tour2.welcomemanado@gmail.com";
export const KAKAO_ICON_PATH =
  "M22.125 0H1.875C.8394 0 0 .8394 0 1.875v20.25C0 23.1606.8394 24 1.875 24h20.25C23.1606 24 24 23.1606 24 22.125V1.875C24 .8394 23.1606 0 22.125 0zM12 18.75c-.591 0-1.1697-.0413-1.7317-.1209-.5626.3965-3.813 2.6797-4.1198 2.7225 0 0-.1258.0489-.2328-.0141s-.0876-.2282-.0876-.2282c.0322-.2198.8426-3.0183.992-3.5333-2.7452-1.36-4.5701-3.7686-4.5701-6.5135C2.25 6.8168 6.6152 3.375 12 3.375s9.75 3.4418 9.75 7.6875c0 4.2457-4.3652 7.6875-9.75 7.6875zM8.0496 9.8672h-.8777v3.3417c0 .2963-.2523.5372-.5625.5372s-.5625-.2409-.5625-.5372V9.8672h-.8777c-.3044 0-.552-.2471-.552-.5508s.2477-.5508.552-.5508h2.8804c.3044 0 .552.2471.552.5508s-.2477.5508-.552.5508zm10.9879 2.9566a.558.558 0 0 1 .108.4167.5588.5588 0 0 1-.2183.371.5572.5572 0 0 1-.3383.1135.558.558 0 0 1-.4493-.2236l-1.3192-1.7479-.1952.1952v1.2273a.5635.5635 0 0 1-.5627.5628.563.563 0 0 1-.5625-.5625V9.3281c0-.3102.2523-.5625.5625-.5625s.5625.2523.5625.5625v1.209l1.5694-1.5694c.0807-.0807.1916-.1252.312-.1252.1404 0 .2814.0606.3871.1661.0985.0984.1573.2251.1654.3566.0082.1327-.036.2542-.1241.3425l-1.2818 1.2817 1.3845 1.8344zm-8.3502-3.5023c-.095-.2699-.3829-.5475-.7503-.5557-.3663.0083-.6542.2858-.749.5551l-1.3455 3.5415c-.1708.5305-.0217.7272.1333.7988a.8568.8568 0 0 0 .3576.0776c.2346 0 .4139-.0952.4678-.2481l.2787-.7297 1.7152.0001.2785.7292c.0541.1532.2335.2484.4681.2484a.8601.8601 0 0 0 .3576-.0775c.1551-.0713.3041-.2681.1329-.7999l-1.3449-3.5398zm-1.3116 2.4433l.5618-1.5961.5618 1.5961H9.3757zm5.9056 1.3836c0 .2843-.2418.5156-.5391.5156h-1.8047c-.2973 0-.5391-.2314-.5391-.5156V9.3281c0-.3102.2576-.5625.5742-.5625s.5742.2523.5742.5625v3.3047h1.1953c.2974 0 .5392.2314.5392.5156z";

type ChatWidget = {
  menuOpen: boolean;
  wechatOpen: boolean;
  kakaoOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  setWechatOpen: (v: boolean) => void;
  setKakaoOpen: (v: boolean) => void;
  /** Dipakai footer: buka kartu tanpa harus membuka menu melayang dulu. */
  openWechat: () => void;
  openKakao: () => void;
};

const Ctx = createContext<ChatWidget | null>(null);

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [kakaoOpen, setKakaoOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setWechatOpen(false);
    setKakaoOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((v) => {
      if (v) {
        setWechatOpen(false);
        setKakaoOpen(false);
      }
      return !v;
    });
  };

  // Kartu QR hidup di komponen melayang. Footer memanggil ini supaya kartunya
  // muncul di sana juga — satu markup kartu, bukan disalin dua kali.
  const openWechat = () => {
    setKakaoOpen(false);
    setWechatOpen(true);
  };

  const openKakao = () => {
    setWechatOpen(false);
    setKakaoOpen(true);
  };

  return (
    <Ctx.Provider
      value={{
        menuOpen,
        wechatOpen,
        kakaoOpen,
        toggleMenu,
        closeMenu,
        setWechatOpen,
        setKakaoOpen,
        openWechat,
        openKakao,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useChatWidget() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatWidget harus dipakai di dalam ChatWidgetProvider");
  return ctx;
}

/** Menyalin teks ke clipboard, dengan cadangan untuk browser/konteks non-HTTPS. */
export async function salinTeks(teks: string) {
  try {
    await navigator.clipboard.writeText(teks);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = teks;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }
}
