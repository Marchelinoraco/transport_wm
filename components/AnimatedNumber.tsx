"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Angka yang bergulir halus ke nilai barunya (mis. total booking saat paket
 * atau jumlah hari diganti). Render pertama = nilai asli, jadi SSR dan
 * pengguna reduce-motion selalu melihat angka yang benar tanpa animasi.
 */
export default function AnimatedNumber({
  value,
  format,
  durationMs = 450,
  className,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const sekarang = useRef(value);

  useEffect(() => {
    const awal = sekarang.current;
    if (awal === value) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      sekarang.current = value;
      setShown(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / durationMs, 1);
      const v = Math.round(awal + (value - awal) * (1 - Math.pow(1 - p, 3)));
      sekarang.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{format(shown)}</span>;
}
