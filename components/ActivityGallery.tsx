"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";
import { useLang } from "@/lib/i18n/LanguageProvider";

type GalleryImage = {
  id: number;
  filename: string;
  url: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

const INTERVAL = 4000; // 4 detik per slide

export default function ActivityGallery() {
  const { dict } = useLang();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/gallery-items?active=1`)
      .then((r) => r.json())
      .then((json) => {
        const items: { id: number; title?: string; image_path?: string }[] =
          Array.isArray(json?.data) ? json.data : (json?.data?.data ?? []);
        setImages(
          items
            .filter((it) => it.image_path)
            .slice(0, 12)
            .map((it) => ({
              id: it.id,
              filename: it.title ?? "Galeri Welcome Manado",
              url: it.image_path as string,
            })),
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const goTo = useCallback((idx: number, total: number) => {
    setFading(true);
    setTimeout(() => {
      setActive((idx + total) % total);
      setFading(false);
    }, 300);
  }, []);

  // Auto-play
  useEffect(() => {
    if (images.length < 2 || paused) return;
    timerRef.current = setInterval(() => {
      goTo(active + 1, images.length);
    }, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, images.length, paused, goTo]);

  if (loading) {
    return (
      <section className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="animate-pulse">
            <div className="mx-auto h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="mx-auto mt-4 h-12 w-2/3 max-w-md rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <div className="aspect-[4/3] rounded-[2rem] bg-slate-100 dark:bg-slate-800 lg:col-span-2" />
              <div className="hidden flex-col gap-3 lg:flex">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (images.length === 0) return null;

  const featured = images[active];

  return (
    <section className="bg-white py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">

        {/* Header */}
        <ScrollReveal>
          <SectionHeader
            center
            eyebrow={dict.home.galleryEyebrow}
            title={dict.home.galleryTitle1}
            titleAccent={dict.home.galleryTitle2}
            subtitle={dict.home.gallerySub}
          />
        </ScrollReveal>

        {/* Main slideshow */}
        <div className="mt-12 grid gap-4 lg:grid-cols-3">

          {/* Featured image — kiri (2/3 lebar) */}
          <div className="relative lg:col-span-2">
            <div
              className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-100 shadow-lg dark:bg-slate-800"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Gambar dengan fade transition */}
              <Image
                key={featured.id}
                src={featured.url}
                alt={featured.filename}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
                className={`object-cover transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
              />

              {/* Overlay gradient bawah */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Nomor + total */}
              <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {active + 1} / {images.length}
              </div>

              {/* Play/Pause */}
              <button
                onClick={() => setPaused((p) => !p)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                {paused
                  ? <Play className="h-3.5 w-3.5 translate-x-0.5" />
                  : <Pause className="h-3.5 w-3.5" />}
              </button>

              {/* Prev / Next buttons */}
              <button
                onClick={() => { setPaused(true); goTo(active - 1, images.length); }}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => { setPaused(true); goTo(active + 1, images.length); }}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Progress bar */}
              {!paused && (
                <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20">
                  <div
                    key={`${active}-${paused}`}
                    className="h-full bg-red-600"
                    style={{
                      animation: `progressBar ${INTERVAL}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Dot navigation */}
            <div className="mt-4 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPaused(true); goTo(i, images.length); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-6 h-2 bg-red-600"
                      : "w-2 h-2 bg-slate-300 hover:bg-red-400 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail strip — kanan (1/3 lebar) */}
          <div className="hidden flex-col gap-3 lg:flex">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={img.id}
                onClick={() => { setPaused(true); goTo(i, images.length); }}
                className={`group relative h-24 w-full overflow-hidden rounded-xl transition ${
                  i === active
                    ? "ring-2 ring-red-600 ring-offset-2 dark:ring-offset-slate-900"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.filename}
                  fill
                  sizes="300px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                {i === active && (
                  <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30" />
                )}
              </button>
            ))}

            {images.length > 4 && (
              <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-slate-400">
                  +{images.length - 4} {dict.gallery.morePhotos}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS keyframe untuk progress bar */}
      <style jsx>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  );
}
