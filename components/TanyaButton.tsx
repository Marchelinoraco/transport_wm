"use client";

import { Car } from "@/lib/types";
import { waLink, formatRupiah } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { adaHarga } from "@/lib/paket";
import { MessageCircle } from "lucide-react";

export default function TanyaButton({ car }: { car: Car }) {
  const { dict } = useLang();

  const message = `Halo Welcome Manado Transport 👋

Saya ingin menanyakan ketersediaan mobil berikut:
🚗 *${car.name}*${car.year ? ` (${car.year})` : ""}
🏷️ Tipe: ${[car.type, car.transmission, car.fuel].filter(Boolean).join(" | ") || "-"}
💵 Harga sewa: ${adaHarga(car.price_rent) ? `${formatRupiah(car.price_rent)}/hari (full day)` : "mohon info harga"}

Apakah mobil ini masih tersedia? Terima kasih.`;

  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-red-600 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-500 dark:hover:text-red-400"
    >
      <MessageCircle className="h-4 w-4" /> {dict.detail.askFirst}
    </a>
  );
}
