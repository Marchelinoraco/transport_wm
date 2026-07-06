"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, Heart } from "lucide-react";
import Logo from "./Logo";
import { waLink, WA_NUMBER } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const { dict } = useLang();

  const menu = [
    { href: "/katalog", label: dict.nav.catalog },
    { href: "/banding", label: dict.footer.compare },
    { href: "/promo", label: dict.nav.promo },
    { href: "/blog", label: dict.nav.blog },
    { href: "/tentang", label: dict.nav.about },
  ];

  const services = [
    { href: "/rental-mobil-manado", label: dict.footer.svcRental },
    { href: "/sewa-mobil-lepas-kunci-manado", label: dict.footer.svcKey },
    { href: "/rental-mobil-dengan-sopir-manado", label: dict.footer.svcDriver },
  ];

  const phoneDisplay = WA_NUMBER.replace(/^62/, "0").replace(
    /(\d{4})(\d{4})(\d+)/,
    "$1-$2-$3",
  );

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 md:grid-cols-4 lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-black uppercase italic tracking-tighter text-red-500">
                Welcome Manado
              </span>
              <span className="mt-1 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                {dict.nav.tagline}
              </span>
            </span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-400">
            {dict.footer.desc}
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-white">
            {dict.footer.menu}
          </h4>
          <ul className="space-y-3 text-sm font-medium">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="transition hover:text-red-500">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-white">
            {dict.footer.services}
          </h4>
          <ul className="space-y-3 text-sm font-medium">
            {services.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="transition hover:text-red-500">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-xs font-black uppercase tracking-[0.3em] text-white">
            {dict.footer.contact}
          </h4>
          <ul className="space-y-3 text-sm font-medium">
            <li>
              <a
                href={waLink(dict.nav.waGreeting)}
                target="_blank"
                className="flex items-center gap-2 transition hover:text-red-500"
              >
                <Phone className="h-4 w-4 text-red-500" /> {phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-red-500" />{" "}
              {dict.footer.location}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-red-500" />{" "}
              {dict.footer.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Welcome Manado Transport.{" "}
        {dict.footer.rights} · {dict.footer.madeWith}{" "}
        <Heart className="inline-block h-3 w-3 fill-red-500 text-red-500" />{" "}
        {dict.footer.forSulut}
      </div>
    </footer>
  );
}
