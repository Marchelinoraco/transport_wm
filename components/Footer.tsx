"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Heart, Mail } from "lucide-react";
import Logo from "./Logo";
import { waLink, WA_NUMBER } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";

// Data kontak & tautan diselaraskan dengan footer situs utama (client_wm)
// supaya customer tidak menemukan informasi berbeda di dua situs.
const MAPS_URL = "https://maps.app.goo.gl/sSe6ReKHVfowT2xs9";
const EMAIL_UTAMA = "info@welcomemanado.com";
const EMAIL_TOUR = "tour.welcomemanado@gmail.com";

// Ikon merek digambar inline: lucide-react tidak lagi menyediakan ikon brand,
// dan path ini disalin apa adanya dari client_wm agar keduanya identik.
const SOSMED = [
  {
    nama: "Instagram",
    href: "https://instagram.com/welcomemanadotours",
    hover: "hover:bg-gradient-to-tr hover:from-amber-500 hover:to-fuchsia-600",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    nama: "TikTok",
    href: "https://www.tiktok.com/@welcomemanadotours?_r=1&_t=ZS-9650ww50qye",
    hover: "hover:bg-black",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
  },
  {
    nama: "Facebook",
    href: "https://web.facebook.com/welcomemanadowisata/",
    hover: "hover:bg-blue-600",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
];

// Dipisah dari SOSMED karena href-nya dibangun waLink() di dalam komponen —
// nomornya hanya boleh hidup di lib/whatsapp.ts, jangan ditulis ulang di sini.
const WHATSAPP = {
  nama: "WhatsApp",
  hover: "hover:bg-green-500",
  path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
};

const MEMBER_OF = [
  { nama: "IINTOA", href: "https://www.iintoa.org/", src: "/images/intoa.jpeg" },
  { nama: "ASITA", href: "https://asita.id/", src: "/images/asita.png" },
  { nama: "ASTINDO", href: "https://astindo.org/", src: "/images/astindo.jpeg" },
];

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

  const sosmed = [
    ...SOSMED,
    { ...WHATSAPP, href: waLink(dict.nav.waGreeting) },
  ];

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
          <div className="mt-6 flex flex-wrap gap-3">
            {sosmed.map((s) => (
              <a
                key={s.nama}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.nama}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition-all duration-300 ${s.hover}`}
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
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
            <li>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 transition hover:text-red-500"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <span>{dict.footer.location}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL_UTAMA}`}
                className="flex items-center gap-2 transition hover:text-red-500"
              >
                <Mail className="h-4 w-4 shrink-0 text-red-500" />
                <span className="break-all">{EMAIL_UTAMA}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL_TOUR}`}
                className="flex items-center gap-2 transition hover:text-red-500"
              >
                <Mail className="h-4 w-4 shrink-0 text-red-500" />
                <span className="break-all">{EMAIL_TOUR}</span>
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-red-500" />{" "}
              {dict.footer.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
          <h3 className="mb-10 text-center text-sm font-medium tracking-[0.2em] text-slate-400">
            ~ Member Of ~
          </h3>
          <div className="flex flex-col items-center justify-center gap-12 opacity-90 md:flex-row md:gap-32">
            {MEMBER_OF.map((m) => (
              <a
                key={m.nama}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-105 hover:opacity-100"
              >
                <Image
                  src={m.src}
                  alt={m.nama}
                  width={200}
                  height={100}
                  className="h-14 w-auto object-contain md:h-16"
                />
              </a>
            ))}
          </div>
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
