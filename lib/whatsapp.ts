export const WA_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282348135155";

export function waLink(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  if (typeof window !== "undefined") {
    window.open(waLink(message), "_blank");
  }
}

export function formatRupiah(value?: number | null) {
  if (value == null) return "-";
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
}
