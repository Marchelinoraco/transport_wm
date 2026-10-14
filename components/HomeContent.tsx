"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Car as CarIcon,
  Key,
  UserCheck,
  Tag,
} from "lucide-react";
import { Car } from "@/lib/types";
import { formatRupiah, waLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import CarCard from "./CarCard";
import Counter from "./Counter";
import ActivityGallery from "./ActivityGallery";
import ScrollReveal from "./ScrollReveal";
import TrustStrip from "./TrustStrip";
import SectionHeader from "./SectionHeader";
import Faq from "./Faq";
import FleetMarquee from "./FleetMarquee";
import { fill } from "@/lib/i18n/format";
import { hargaMulai } from "@/lib/paket";

const HERO_INTERVAL = 6000;

export default function HomeContent({ cars }: { cars: Car[] }) {
  const { dict } = useLang();

  const heroImages = useMemo(
    () => cars.filter((c) => c.images.length > 0).slice(0, 6),
    [cars],
  );
  const [heroIdx, setHeroIdx] = useState(0);

  // setTimeout per slide (bukan setInterval) agar klik indikator memulai
  // hitungan ulang. Pengguna reduce-motion: tidak berganti sendiri.
  useEffect(() => {
    if (heroImages.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setHeroIdx((i) => (i + 1) % heroImages.length), HERO_INTERVAL);
    return () => clearTimeout(t);
  }, [heroIdx, heroImages.length]);

  const mulai = hargaMulai(cars);

  const featured = cars
    .filter((c) => c.badge === "POPULER" || c.badge === "BARU")
    .slice(0, 6);
  const showcase = featured.length ? featured : cars.slice(0, 6);
  const availableCount = cars.filter((c) => c.status === "tersedia").length;

  const services = [
    {
      icon: CarIcon,
      title: dict.home.svcDailyTitle,
      desc: dict.home.svcDailyDesc,
      href: "/rental-mobil-manado",
    },
    {
      icon: UserCheck,
      title: dict.home.svcDriverTitle,
      desc: dict.home.svcDriverDesc,
      href: "/rental-mobil-dengan-sopir-manado",
    },
    {
      icon: Key,
      title: dict.home.svcKeyTitle,
      desc: dict.home.svcKeyDesc,
      href: "/sewa-mobil-lepas-kunci-manado",
    },
  ];

  const stats = [
    { value: availableCount || 50, suffix: "+", label: dict.hero.statCars },
    { value: 1200, suffix: "+", label: dict.hero.statClients },
    { value: 8, suffix: "+", label: dict.hero.statYears },
    { value: 25, suffix: "+", label: dict.hero.statPartners },
  ];

  return (
    <>
      {/* ═══ HERO full-screen gaya client_wm ═══ */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-slate-900">
        {/* Background carousel */}
        {heroImages.map((c, i) => (
          <div
            key={c.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ${
              i === heroIdx ? "opacity-40" : "opacity-0"
            }`}
          >
            <Image
              src={c.images[0]}
              alt={c.name}
              fill
              sizes="100vw"
              priority={i === 0}
              className={`object-cover ${i === heroIdx ? "animate-subtle-zoom" : ""}`}
            />
          </div>
        ))}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/80" />

        {/* Glow orbs merah */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 animate-pulse rounded-full bg-red-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-red-600/10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 text-center lg:px-6">
          {/* Badge glass */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.25em] text-white backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              {dict.hero.badge}
            </span>
          </div>

          {/* Judul raksasa */}
          <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-black leading-[0.95] tracking-tighter text-white sm:text-7xl lg:text-8xl">
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="block animate-mask-up" style={{ animationDelay: "120ms" }}>
                {dict.hero.title1}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span
                className="block animate-mask-up bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent"
                style={{ animationDelay: "260ms" }}
              >
                {dict.hero.title2}
              </span>
            </span>
          </h1>

          <p
            className="mx-auto mt-8 max-w-2xl animate-fade-in-up text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            {dict.hero.subtitle}
          </p>

          {mulai !== null && (
            <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <Link
                href="/katalog"
                className="kilau kilau-loop relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2 text-sm font-black text-red-600 shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5"
              >
                <Tag className="h-4 w-4" /> {fill(dict.paket.priceChip, { price: formatRupiah(mulai) })}
              </Link>
            </div>
          )}

          {/* CTA */}
          <div
            className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              href="/katalog"
              className="group inline-flex items-center gap-2 rounded-[2rem] bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-red-600/30 active:scale-95"
            >
              {dict.hero.ctaCatalog}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a
              href={waLink(dict.hero.waMessage)}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-[2rem] border-2 border-white/20 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <MessageCircle className="h-4 w-4 text-red-400" /> {dict.hero.ctaWa}
            </a>
          </div>

          {/* Stats */}
          <div
            className="mx-auto mt-16 grid max-w-2xl animate-fade-in-up grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4"
            style={{ animationDelay: "480ms" }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center [&_div]:!text-white [&_div+div]:!text-white/60">
                <Counter to={s.value} suffix={s.suffix} label={s.label} size="sm" />
              </div>
            ))}
          </div>
        </div>
        {heroImages.length > 1 && (
          <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center gap-2">
            {heroImages.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setHeroIdx(i)}
                aria-label={fill(dict.home.heroSlide, { n: i + 1 })}
                aria-current={i === heroIdx}
                className="h-1.5 w-10 overflow-hidden rounded-full bg-white/25 transition hover:bg-white/40"
              >
                {i === heroIdx && (
                  <span
                    key={heroIdx}
                    className="block h-full origin-left animate-progress bg-white"
                    style={{ animationDuration: `${HERO_INTERVAL}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <FleetMarquee cars={cars} />

      {/* ═══ TRUST STRIP ═══ */}
      <section className="bg-slate-50 py-14 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <ScrollReveal>
            <TrustStrip />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ LAYANAN ═══ */}
      <section className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <ScrollReveal className="mb-14">
            <SectionHeader
              center
              eyebrow={dict.home.servicesEyebrow}
              title={dict.home.servicesTitle1}
              titleAccent={dict.home.servicesTitle2}
              subtitle={dict.home.servicesSub}
            />
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => (
              <ScrollReveal key={svc.href} delay={i * 60} variant="scale">
                <Link
                  href={svc.href}
                  className="group flex h-full flex-col gap-5 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/10 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 transition group-hover:bg-red-600 dark:bg-red-900/20">
                    <svc.icon className="h-6 w-6 text-red-600 transition group-hover:text-white" />
                  </span>
                  <div>
                    <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      {svc.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {svc.desc}
                    </p>
                  </div>
                  <span className="mt-auto flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-600">
                    {dict.home.more}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ARMADA UNGGULAN ═══ */}
      <section className="bg-slate-50 py-24 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <ScrollReveal variant="left" className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow={dict.home.fleetEyebrow}
              title={dict.home.fleetTitle1}
              titleAccent={dict.home.fleetTitle2}
              subtitle={dict.home.fleetSub}
            />
            <Link
              href="/katalog"
              className="hidden items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-600 hover:underline sm:flex"
            >
              {dict.home.seeAll} <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((car, i) => (
              <ScrollReveal key={car.id} delay={i * 60}>
                <CarCard car={car} />
              </ScrollReveal>
            ))}
          </div>
          {showcase.length === 0 && (
            <p className="py-16 text-center text-slate-400">
              {dict.home.emptyFleet}
            </p>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/katalog"
              className="text-xs font-black uppercase tracking-widest text-red-600 hover:underline"
            >
              {dict.home.seeAllFleet} →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ GALERI AKTIVITAS ═══ */}
      <ActivityGallery />

      {/* ═══ FAQ ═══ */}
      <section className="bg-slate-50 py-24 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <ScrollReveal className="mb-14">
            <SectionHeader
              center
              eyebrow={dict.home.faqEyebrow}
              title={dict.home.faqTitle1}
              titleAccent={dict.home.faqTitle2}
            />
          </ScrollReveal>
          <ScrollReveal>
            <Faq />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-red-600 via-red-700 to-red-900 bg-[length:200%_200%] animate-gradient-shift px-8 py-20 text-center shadow-2xl shadow-red-900/20 md:px-16">
              <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-white backdrop-blur-md">
                  <MessageCircle className="h-3.5 w-3.5" /> {dict.home.ctaBadge}
                </span>
                <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-black tracking-tighter text-white md:text-5xl">
                  {dict.home.ctaTitle}
                </h2>
                <p className="mx-auto mt-5 max-w-lg text-white/80">
                  {dict.home.ctaSub}
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <a
                    href={waLink(dict.home.ctaWaMessage)}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-[2rem] bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-red-700 shadow-xl transition hover:-translate-y-0.5 active:scale-95"
                  >
                    <MessageCircle className="h-5 w-5" /> {dict.home.ctaWa}
                  </a>
                  <Link
                    href="/katalog"
                    className="inline-flex items-center gap-2 rounded-[2rem] border-2 border-white/30 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-white/10 active:scale-95"
                  >
                    {dict.home.ctaCatalog} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
