"use client";

// Pola client_wm: locale disimpan di localStorage["locale"], default Indonesia,
// SSR merender teks Indonesia lalu locale pilihan diterapkan setelah hidrasi.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  dictionaries,
  locales,
  type Dictionary,
  type Locale,
} from "./dictionaries";
import { langFromSearch, urlWithoutLang } from "./lang-param";

type LangContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dict: Dictionary;
};

const LangContext = createContext<LangContextValue>({
  locale: "id",
  setLocale: () => {},
  dict: dictionaries.id,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    // `?lang=` dari link welcomemanado.com / manado.tours mengalahkan pilihan
    // tersimpan, lalu dibuang dari address bar supaya URL yang dibagikan bersih.
    const dariUrl = langFromSearch(window.location.search);
    if (dariUrl) {
      setLocale(dariUrl);
      history.replaceState(history.state, "", urlWithoutLang(window.location.href));
      return;
    }
    const saved = localStorage.getItem("locale");
    if (saved && (locales as readonly string[]).includes(saved)) {
      setLocaleState(saved as Locale);
      document.documentElement.lang = saved;
    }
  }, [setLocale]);

  return (
    <LangContext.Provider
      value={{ locale, setLocale, dict: dictionaries[locale] }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
