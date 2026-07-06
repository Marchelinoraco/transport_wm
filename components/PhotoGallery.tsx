"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

const LABELS = ["Tampak Depan", "Tampak Samping", "Tampak Belakang", "Interior", "Dashboard"];

export default function PhotoGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[2rem] border border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800">
        Foto belum tersedia
      </div>
    );
  }

  return (
    <>
      <div
        className="group relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm dark:border-slate-800"
        onClick={() => setLightbox(true)}
      >
        <Image
          src={images[active]}
          alt={`${name} — ${LABELS[active] ?? `Foto ${active + 1}`}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 66vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <ZoomIn className="h-4 w-4" /> Perbesar
          </span>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">
          {active + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-red-600 shadow-sm"
                  : "border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-600"
              }`}
              title={LABELS[i] ?? `Foto ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${name} — ${LABELS[i] ?? `Foto ${i + 1}`}`}
                fill
                sizes="15vw"
                className={`object-cover transition ${i === active ? "" : "opacity-70 group-hover:opacity-100"}`}
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] text-white">
                {LABELS[i] ?? `Foto ${i + 1}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${name} — ${LABELS[active] ?? `Foto ${active + 1}`}`}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-red-600" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
          <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm font-medium text-white/70">
            {LABELS[active] ?? `Foto ${active + 1}`} — {active + 1}/{images.length}
          </p>
        </div>
      )}
    </>
  );
}
