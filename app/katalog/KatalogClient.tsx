"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ArrowDownUp, CarFront } from "lucide-react";
import { Car } from "@/lib/types";
import CarCard from "@/components/CarCard";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { useLang } from "@/lib/i18n/LanguageProvider";

const typeFilters = ["MPV", "SUV", "Sedan", "City Car", "Pickup", "Minibus"];
const transmissions = ["Manual", "Otomatis"];
const fuels = ["Bensin", "Solar", "Hybrid"];

export default function KatalogClient({ cars }: { cars: Car[] }) {
  const { dict } = useLang();

  const priceBounds = useMemo(() => {
    const prices = cars.map((c) => c.price_rent ?? 0).filter(Boolean);
    return { min: 0, max: prices.length ? Math.max(...prices) : 1000000 };
  }, [cars]);

  const [query, setQuery] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);
  const [fuel, setFuel] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sort, setSort] = useState("terbaru");
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { key: "terbaru", label: dict.catalog.sortNewest },
    { key: "harga-asc", label: dict.catalog.sortCheapest },
    { key: "harga-desc", label: dict.catalog.sortExpensive },
    { key: "tahun-desc", label: dict.catalog.sortYear },
  ];

  const result = useMemo(() => {
    let r = cars.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(query.toLowerCase());
      const matchType = !type || c.type === type;
      const matchTrans = !transmission || c.transmission === transmission;
      const matchFuel = !fuel || c.fuel === fuel;
      const matchPrice = (c.price_rent ?? 0) <= maxPrice || c.price_rent == null;
      return matchSearch && matchType && matchTrans && matchFuel && matchPrice;
    });

    r = [...r].sort((a, b) => {
      switch (sort) {
        case "harga-asc": return (a.price_rent ?? Infinity) - (b.price_rent ?? Infinity);
        case "harga-desc": return (b.price_rent ?? 0) - (a.price_rent ?? 0);
        case "tahun-desc": return (b.year ?? 0) - (a.year ?? 0);
        default: return b.id - a.id;
      }
    });
    return r;
  }, [cars, query, type, transmission, fuel, maxPrice, sort]);

  const activeChips = [
    type && { label: type, clear: () => setType(null) },
    transmission && { label: transmission, clear: () => setTransmission(null) },
    fuel && { label: fuel, clear: () => setFuel(null) },
    maxPrice < priceBounds.max && {
      label: `≤ Rp ${(maxPrice / 1000).toLocaleString("id-ID")}rb`,
      clear: () => setMaxPrice(priceBounds.max),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  function resetAll() {
    setQuery(""); setType(null);
    setTransmission(null); setFuel(null); setMaxPrice(priceBounds.max); setSort("terbaru");
  }

  const pill = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
      active
        ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
        : "border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-800 dark:hover:text-red-400"
    }`;

  const filterLabel =
    "mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400";

  return (
    <div>
      <SectionHeader
        eyebrow={dict.nav.catalog}
        title={dict.catalog.title}
        subtitle={dict.catalog.subtitle}
      />

      <div className="mt-10">
        {/* Search + sort + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.catalog.search}
              className="w-full rounded-2xl border-none bg-slate-50 py-3.5 pl-11 pr-4 font-bold text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600/20 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <ArrowDownUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-2xl border-none bg-slate-50 py-3.5 pl-11 pr-8 text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-red-600/20 dark:bg-slate-800 dark:text-slate-300"
            >
              {sortOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>

          <button onClick={() => setShowFilters((v) => !v)} className={pill(showFilters)}>
            <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> {dict.catalog.filter}</span>
          </button>
        </div>

        {/* Panel filter lanjutan */}
        {showFilters && (
          <div className="mt-5 grid gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-7 dark:border-slate-800 dark:bg-slate-800/50 md:grid-cols-2">
            <div>
              <p className={filterLabel}>{dict.catalog.carType}</p>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((t) => (
                  <button key={t} onClick={() => setType(type === t ? null : t)} className={pill(type === t)}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <p className={filterLabel}>{dict.catalog.transmission}</p>
              <div className="flex flex-wrap gap-2">
                {transmissions.map((t) => (
                  <button key={t} onClick={() => setTransmission(transmission === t ? null : t)} className={pill(transmission === t)}>{t}</button>
                ))}
              </div>
              <p className={`${filterLabel} mt-5`}>{dict.catalog.fuel}</p>
              <div className="flex flex-wrap gap-2">
                {fuels.map((f) => (
                  <button key={f} onClick={() => setFuel(fuel === f ? null : f)} className={pill(fuel === f)}>{f}</button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <p className={filterLabel}>{dict.catalog.maxPrice}</p>
                <span className="text-sm font-black text-red-600">Rp {maxPrice.toLocaleString("id-ID")}</span>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>
          </div>
        )}

        {/* Chip filter aktif */}
        {activeChips.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{dict.catalog.activeFilters}</span>
            {activeChips.map((chip, i) => (
              <button
                key={i}
                onClick={chip.clear}
                className="flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-black text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
              >
                {chip.label} <X className="h-3 w-3" />
              </button>
            ))}
            <button onClick={resetAll} className="text-xs font-bold text-red-500 hover:underline">
              {dict.catalog.resetAll}
            </button>
          </div>
        )}

        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          {dict.catalog.showing}{" "}
          <span className="font-black text-slate-900 dark:text-white">{result.length}</span>{" "}
          {dict.catalog.carsUnit}
        </p>

        {result.length === 0 ? (
          <div className="mt-10 rounded-[2.5rem] border border-dashed border-slate-300 py-20 text-center dark:border-slate-700">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-50 dark:bg-slate-800">
              <CarFront className="h-8 w-8 text-slate-300" />
            </span>
            <p className="mt-5 font-bold text-slate-400">{dict.catalog.emptyTitle}</p>
            <button
              onClick={resetAll}
              className="mt-6 rounded-2xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 active:scale-95"
            >
              {dict.catalog.reset}
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {result.map((car, i) => (
              <ScrollReveal key={car.id} delay={Math.min(i, 6) * 50}>
                <CarCard car={car} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
