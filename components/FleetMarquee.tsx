"use client";

import Image from "next/image";
import Link from "next/link";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { adaHarga } from "@/lib/paket";
import { formatRupiah } from "@/lib/whatsapp";

/**
 * Strip armada yang bergulir pelan di bawah hero. Daftar digandakan agar
 * putarannya mulus (translateX -50%); salinan kedua disembunyikan dari pembaca
 * layar dan dari Tab. Berhenti saat disentuh/di-hover/difokus.
 */
export default function FleetMarquee({ cars }: { cars: Car[] }) {
  const { dict } = useLang();
  const list = cars.filter((c) => c.images.length > 0);
  if (list.length < 3) return null;
  const putaran = [...list, ...list];

  return (
    <section aria-label={dict.home.marqueeLabel} className="border-b border-slate-100 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="marquee-viewport group overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
          {putaran.map((c, i) => {
            const salinan = i >= list.length;
            return (
              <li key={`${c.id}-${i}`} aria-hidden={salinan || undefined}>
                <Link
                  href={`/mobil/${c.slug}`}
                  tabIndex={salinan ? -1 : undefined}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 py-2 pl-2 pr-5 transition hover:border-red-200 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <span className="relative h-12 w-20 overflow-hidden rounded-xl bg-white">
                    <Image src={c.images[0]} alt="" fill sizes="80px" className="object-contain" />
                  </span>
                  <span>
                    <span className="block whitespace-nowrap text-sm font-black text-slate-900 dark:text-white">{c.name}</span>
                    <span className="block text-xs font-bold text-red-600">
                      {adaHarga(c.price_rent) ? `${formatRupiah(c.price_rent)}${dict.paket.perDay}` : dict.paket.askPrice}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
