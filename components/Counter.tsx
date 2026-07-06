"use client";

import { useEffect, useRef, useState } from "react";

export default function Counter({
  to,
  suffix = "",
  label,
  size = "lg",
}: {
  to: number;
  suffix?: string;
  label: string;
  size?: "sm" | "lg";
}) {
  // Inisialisasi dengan angka final → SSR & no-JS menampilkan nilai asli (penting untuk SEO/crawler).
  const [value, setValue] = useState(to);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hormati preferensi reduce-motion: biarkan angka final, tanpa animasi.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      started.current = true;
      return;
    }

    // Jika elemen sudah terlihat saat mount (mis. di hero/atas layar),
    // tampilkan angka asli langsung tanpa flash ke 0.
    const rect = el.getBoundingClientRect();
    const inViewAtMount = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewAtMount) {
      started.current = true;
      return;
    }

    // Elemen di bawah layar: reset (saat masih tak terlihat) lalu animasikan saat masuk viewport.
    setValue(0);
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setValue(Math.floor(p * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  if (size === "sm") {
    return (
      <div ref={ref}>
        <div className="text-2xl font-bold text-red-600">
          {value}{suffix}
        </div>
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold text-red-600 md:text-5xl">
        {value}{suffix}
      </div>
      <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
