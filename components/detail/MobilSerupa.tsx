"use client";

import Image from "next/image";
import Link from "next/link";
import { Car } from "@/lib/types";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { formatRupiah } from "@/lib/whatsapp";

export default function MobilSerupa({ cars }: { cars: Car[] }) {
  const { dict } = useLang();
  if (!cars.length) return null;
  return (
    <div>
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.detail.similar}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cars.map((c) => (
          <Link
            key={c.id}
            href={`/mobil/${c.slug}`}
            className="group overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="relative block aspect-[16/10] bg-white">
              {c.images[0] && <Image src={c.images[0]} alt={c.name} fill sizes="(max-width:640px) 50vw, 200px" className="object-contain p-2 transition duration-500 group-hover:scale-105" />}
            </span>
            <span className="block px-3 pb-3">
              <span className="block text-xs font-black leading-tight text-slate-900 dark:text-white">{c.name}</span>
              <span className="mt-1 block text-xs font-bold text-red-600">
                {formatRupiah(c.price_rent)}<span className="text-slate-400">{dict.paket.perDay}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
