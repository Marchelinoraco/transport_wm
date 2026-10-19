"use client";

import { useEffect, useRef } from "react";
import { DURASI_KILAU, LAPIS_KILAU, jalurNotch, offsetLapis, pusatKilau } from "@/lib/navbar-tepi";

const NS = "http://www.w3.org/2000/svg";

/**
 * Garis tepi notch: jalur yang menelusuri seluruh bentuknya (termasuk sudut
 * cekung atas) dan kilau simetris yang berjalan kiri → kanan. Jalur dibangun
 * ulang setiap kali ukuran notch berubah (lebar layar, bahasa, keadaan).
 * Loop animasi hanya berjalan selama `aktif` (notch hitam) — saat kaca garisnya
 * tak terlihat, jadi tidak ada kerja per frame. Gerak minimal: hanya garis dasar yang diam.
 */
export default function GarisKilau({ target, aktif }: { target: React.RefObject<HTMLElement>; aktif: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const notch = target.current, svg = svgRef.current;
    if (!notch || !svg) return;
    const gerakMinimal = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let lapis: [SVGPathElement, number][] = [];
    let L = 0, M = 0, raf = 0;

    const buat = (d: string, tebal: number, warna: string, op: number, cahaya: number) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      Object.assign(p.style, { fill: "none", stroke: warna, strokeWidth: String(tebal), opacity: String(op), strokeLinecap: "round" });
      if (cahaya) {
        const terang = warna === "#fff" || warna === "#fecaca";
        p.style.filter = `drop-shadow(0 0 ${cahaya}px ${terang ? "rgba(255,255,255,.95)" : "rgba(239,68,68,.95)"})`;
      }
      svg.appendChild(p);
      return p;
    };

    const atur = (waktu: number) => {
      const pusat = pusatKilau(waktu, L, M, DURASI_KILAU);
      for (const [p, len] of lapis) p.style.strokeDashoffset = String(offsetLapis(pusat, len));
    };

    const bangun = () => {
      const cs = getComputedStyle(notch);
      const r = parseFloat(cs.getPropertyValue("--r")) || 22;
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      const W = notch.offsetWidth, H = notch.offsetHeight;
      const rb = Math.min(parseFloat(cs.borderBottomLeftRadius) || 26, H / 2);
      // svg diposisikan relatif ke padding box notch; geser keluar setebal tepi kiri agar x = r tepat di sisi luar notch
      Object.assign(svg.style, { left: `${-(r + bl)}px`, width: `${W + 2 * r}px`, height: `${H}px` });
      svg.replaceChildren();
      const d = jalurNotch({ lebar: W, tinggi: H, r, rb });
      const dasar = buat(d, 1.1, "rgba(255,255,255,.08)", 1, 0);
      L = dasar.getTotalLength();
      M = (Math.max(...LAPIS_KILAU.map((l) => l[0])) * L) / 2;
      lapis = gerakMinimal
        ? []
        : LAPIS_KILAU.map(([frak, tebal, warna, op, cahaya]) => {
            const p = buat(d, tebal, warna, op, cahaya), len = frak * L;
            p.style.strokeDasharray = `${len} ${L + 2 * M + len}`;
            return [p, len] as [SVGPathElement, number];
          });
      // posisi kilau langsung benar — juga saat dibangun ulang ketika loop berhenti (kilau memudar di tempatnya)
      atur(performance.now());
    };

    const gambar = (waktu: number) => {
      if (!document.hidden) atur(waktu);
      raf = requestAnimationFrame(gambar);
    };

    const ro = new ResizeObserver(bangun);
    ro.observe(notch);
    bangun();
    if (aktif && !gerakMinimal) raf = requestAnimationFrame(gambar);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, aktif]);

  return <svg ref={svgRef} aria-hidden="true" className="garis-kilau pointer-events-none absolute top-0 overflow-visible" />;
}
