import type { Paket } from "./paket";
import type { HasilBooking, InputBooking, PilihanArea } from "./hitungBooking";
import { formatRupiah } from "./whatsapp";
import { HARGA_BERLAKU_SEJAK, NAMA_AREA } from "./tarif-sewa";
import { formatTanggal } from "./i18n/format";

export type DataPemesan = { nama: string; telepon: string; tanggalMulai: string; catatan: string };

/** Hari terakhir sewa. Dihitung di UTC supaya tidak bergeser di zona waktu pengunjung. */
export function tanggalSelesai(mulai: string, hari: number): string {
  const d = new Date(`${mulai}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + hari - 1);
  return d.toISOString().slice(0, 10);
}

// Pesan WhatsApp dibaca tim Welcome Manado, jadi selalu berbahasa Indonesia.
const LABEL_PAKET: Record<Paket, string> = {
  full_day: "Full day (maks. 12 jam, dengan sopir)",
  transfer: "Transfer sekali jalan (dengan sopir)",
  self_drive: "Lepas kunci (maks. 12 jam, tanpa sopir)",
};

function labelArea(area: PilihanArea): string {
  if (area === "pool") return "Ambil & kembalikan di pool";
  if (area === 4) return "Area 4 — dikonfirmasi";
  return `Area ${area} — ${NAMA_AREA.id[area]}`;
}

export function buatPayloadBooking(input: InputBooking, hasil: HasilBooking, p: DataPemesan) {
  const hari = input.paket === "transfer" ? null : hasil.jumlah;
  const catatan = [
    input.paket === "transfer" ? `Transfer ${hasil.jumlah} trip` : null,
    input.area === "pool" ? "Ambil & kembalikan di pool" : null,
    p.catatan.trim() || null,
  ].filter(Boolean);

  return {
    transportation_id: input.car.id,
    customer_name: p.nama.trim(),
    customer_phone: p.telepon.trim(),
    booking_date: p.tanggalMulai,
    end_date: hari && hari > 1 ? tanggalSelesai(p.tanggalMulai, hari) : null,
    duration_days: hari,
    dengan_sopir: input.paket !== "self_drive",
    package: input.paket,
    area: input.area === "pool" ? null : input.area,
    total_price: hasil.total,
    notes: catatan.length ? catatan.join(" — ") : null,
  };
}

export function buatPesanWa(input: InputBooking, hasil: HasilBooking, p: DataPemesan): string {
  const harian = input.paket !== "transfer";
  const satuan = harian ? "hari" : "trip";
  const selesai = harian && hasil.jumlah > 1 && p.tanggalMulai ? tanggalSelesai(p.tanggalMulai, hasil.jumlah) : "";

  const rincian = [`   • Sewa ${formatRupiah(hasil.tarif)} × ${hasil.jumlah} ${satuan} = ${formatRupiah(hasil.sewa)}`];
  if (hasil.jenisTambahan === "area") {
    rincian.push(
      hasil.dikonfirmasi
        ? "   • Biaya area: dikonfirmasi"
        : `   • Biaya Area ${input.area} ${formatRupiah(hasil.tarifTambahan)} × ${hasil.jumlah} hari = ${formatRupiah(hasil.biayaTambahan)}`,
    );
  }
  if (hasil.jenisTambahan === "antar") {
    rincian.push(
      hasil.dikonfirmasi
        ? "   • Antar-jemput: dikonfirmasi"
        : `   • Antar-jemput Area ${input.area} = ${formatRupiah(hasil.biayaTambahan)}`,
    );
  }
  if (input.paket === "transfer" && hasil.dikonfirmasi) {
    rincian.push("   • Biaya transfer ke luar Kota Manado: dikonfirmasi");
  }

  return `🚗 *BOOKING — WELCOME MANADO TRANSPORT*

👤 Nama       : ${p.nama.trim() || "-"}
📱 No. WA     : ${p.telepon.trim() || "-"}
🚙 Mobil      : ${input.car.name}
📦 Paket      : ${LABEL_PAKET[input.paket]}
📅 Tanggal    : ${p.tanggalMulai || "-"}${selesai ? ` s/d ${selesai}` : ""}
⏱️ Jumlah     : ${hasil.jumlah} ${satuan}
📍 ${input.paket === "self_drive" ? "Serah terima" : "Area tujuan "} : ${labelArea(input.area)}
💵 Rincian    :
${rincian.join("\n")}
💰 Est. Total : ${formatRupiah(hasil.total)}${hasil.dikonfirmasi ? " + biaya yang dikonfirmasi" : ""}
📝 Catatan    : ${p.catatan.trim() || "-"}
✅ Menyetujui Syarat & Ketentuan versi ${formatTanggal(HARGA_BERLAKU_SEJAK, "id")}

Mohon konfirmasi ketersediaan & harga final. Terima kasih! 🙏`;
}
