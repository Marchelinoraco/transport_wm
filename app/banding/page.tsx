"use client";

import Image from "next/image";
import Link from "next/link";
import { useCompare } from "@/components/CompareProvider";
import { formatRupiah, waLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import SectionHeader from "@/components/SectionHeader";
import { X, GitCompareArrows, MessageCircle, ArrowLeft, Check, Minus } from "lucide-react";

export default function BandingPage() {
  const { items, remove, clear } = useCompare();
  const { dict } = useLang();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-28 text-center lg:px-6">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-slate-50 dark:bg-slate-800">
          <GitCompareArrows className="h-9 w-9 text-slate-300 dark:text-slate-600" />
        </span>
        <h1 className="mt-8 text-3xl font-black tracking-tighter text-slate-900 dark:text-white md:text-4xl">
          {dict.compare.emptyTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-500 dark:text-slate-400">
          {dict.compare.emptyDesc}
        </p>
        <Link
          href="/katalog"
          className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-7 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> {dict.compare.toCatalog}
        </Link>
      </section>
    );
  }

  const rows: { label: string; render: (c: (typeof items)[number]) => React.ReactNode }[] = [
    { label: dict.compare.type, render: (c) => c.type || "—" },
    {
      label: dict.compare.status,
      render: (c) => (
        <span className="capitalize">
          {c.status === "tersedia" ? dict.car.available : dict.car.rented}
        </span>
      ),
    },
    {
      label: dict.compare.rentPrice,
      render: (c) => (
        <span className="font-black text-red-600">
          {formatRupiah(c.price_rent)}
          <span className="font-normal text-slate-400">
            {c.price_unit === "per_trip" ? dict.car.perTrip : dict.car.perDay}
          </span>
        </span>
      ),
    },
    { label: dict.car.year, render: (c) => c.year ?? "—" },
    { label: dict.car.seatsLabel, render: (c) => (c.seats != null ? `${c.seats} ${dict.car.seats}` : "—") },
    { label: dict.car.transmission, render: (c) => c.transmission ?? "—" },
    { label: dict.car.fuel, render: (c) => c.fuel ?? "—" },
    {
      label: dict.compare.withDriver,
      render: (c) => c.dengan_sopir
        ? <Check className="mx-auto h-4 w-4 text-red-600" />
        : <Minus className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          eyebrow={dict.footer.compare}
          title={dict.compare.title}
          subtitle={`${items.length} ${dict.compare.counted}`}
        />
        <button
          onClick={clear}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-red-400"
        >
          {dict.compare.clearAll}
        </button>
      </div>

      <div className="mt-10 overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm dark:border-slate-800">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="w-40 bg-slate-50 p-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {dict.compare.spec}
              </th>
              {items.map((c) => (
                <th key={c.id} className="border-l border-slate-100 p-4 align-top dark:border-slate-800">
                  <div className="relative mx-auto aspect-[16/10] w-full max-w-[200px] overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                    {c.images[0] ? (
                      <Image src={c.images[0]} alt={c.name} fill sizes="200px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-50 text-xs text-slate-400 dark:bg-slate-800">
                        {dict.compare.noPhoto}
                      </div>
                    )}
                    <button
                      onClick={() => remove(c.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-red-600 p-1 text-white shadow-lg shadow-red-600/30"
                      aria-label="Hapus"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="mt-3 font-black tracking-tight text-slate-900 dark:text-white">{c.name}</p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm text-slate-700 dark:text-slate-300">
            {rows.map((row, ri) => (
              <tr key={row.label} className={ri % 2 ? "bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-900"}>
                <td className="bg-slate-50 p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {row.label}
                </td>
                {items.map((c) => (
                  <td key={c.id} className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
                    {row.render(c)}
                  </td>
                ))}
              </tr>
            ))}

            <tr className="bg-white dark:bg-slate-900">
              <td className="bg-slate-50 p-4 dark:bg-slate-800" />
              {items.map((c) => (
                <td key={c.id} className="border-l border-slate-100 p-4 text-center dark:border-slate-800">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/mobil/${c.slug}`}
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-800"
                    >
                      {dict.car.detail}
                    </Link>
                    <a
                      href={waLink(`Halo Welcome Manado Transport, saya tertarik dengan ${c.name}${c.year ? ` (${c.year})` : ""}. Mohon info lebih lanjut.`)}
                      target="_blank"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition hover:opacity-90"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <Link href="/katalog" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> {dict.compare.addMore}
        </Link>
      </div>
    </section>
  );
}
