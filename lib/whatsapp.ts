// Nomor resmi Welcome Manado, sama dengan yang tampil di situs utama
// (client_wm). Disamakan supaya customer tidak menemui dua nomor berbeda.
// CATATAN: NEXT_PUBLIC_WHATSAPP_NUMBER di server MENANG atas nilai ini —
// mengubah baris ini saja tidak mengubah apa pun bila env var itu terpasang.
export const WA_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6282173738822";

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
