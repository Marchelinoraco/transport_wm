import { afterEach, describe, it, expect } from "vitest";
import { buatPayloadBooking, buatPesanWa, tanggalSelesai } from "./booking";
import { hitungBooking, type InputBooking } from "./hitungBooking";
import { mobil } from "./test/mobil";

const pemesan = { nama: " Budi ", telepon: " 0812 ", tanggalMulai: "2026-10-30", catatan: "" };
const xpander = mobil({ id: 14, name: "Mitsubishi Xpander", price_rent: 850_000, price_transfer: 350_000, price_self_drive: 500_000, engine_cc: 1499 });

function siapkan(input: InputBooking) {
  const hasil = hitungBooking(input);
  if (!hasil) throw new Error("paket tidak tersedia");
  return hasil;
}

describe("tanggalSelesai", () => {
  const tzAsli = process.env.TZ;
  afterEach(() => {
    process.env.TZ = tzAsli;
  });

  it("menghitung hari terakhir, melewati akhir bulan dan tahun", () => {
    expect(tanggalSelesai("2026-10-30", 3)).toBe("2026-11-01");
    expect(tanggalSelesai("2026-12-31", 1)).toBe("2026-12-31");
    expect(tanggalSelesai("2026-12-31", 2)).toBe("2027-01-01");
  });

  it("tidak bergeser di zona waktu negatif (turis Amerika)", () => {
    process.env.TZ = "America/Los_Angeles";
    expect(tanggalSelesai("2026-11-01", 2)).toBe("2026-11-02");
  });
});

describe("buatPayloadBooking", () => {
  it("lepas kunci: tanpa sopir, area, durasi, tanggal selesai, total", () => {
    const input: InputBooking = { car: xpander, paket: "self_drive", jumlah: 2, area: 2 };
    expect(buatPayloadBooking(input, siapkan(input), pemesan)).toEqual({
      transportation_id: 14,
      customer_name: "Budi",
      customer_phone: "0812",
      booking_date: "2026-10-30",
      end_date: "2026-10-31",
      duration_days: 2,
      dengan_sopir: false,
      package: "self_drive",
      area: 2,
      total_price: 1_300_000,
      notes: null,
    });
  });

  it("transfer: dengan sopir, tanpa durasi hari, jumlah trip di catatan", () => {
    const input: InputBooking = { car: xpander, paket: "transfer", jumlah: 2, area: 1 };
    const p = buatPayloadBooking(input, siapkan(input), { ...pemesan, catatan: "Bandara 08.00" });
    expect(p).toMatchObject({ dengan_sopir: true, package: "transfer", duration_days: null, end_date: null, area: 1, total_price: 700_000 });
    expect(p.notes).toBe("Transfer 2 trip — Bandara 08.00");
  });

  it("ambil di pool: area null, dicatat di notes", () => {
    const input: InputBooking = { car: xpander, paket: "self_drive", jumlah: 1, area: "pool" };
    const p = buatPayloadBooking(input, siapkan(input), pemesan);
    expect(p.area).toBeNull();
    expect(p.notes).toBe("Ambil & kembalikan di pool");
  });
});

describe("buatPesanWa", () => {
  it("memuat paket, area, rincian, total, dan versi S&K", () => {
    const input: InputBooking = { car: xpander, paket: "self_drive", jumlah: 2, area: 2 };
    const pesan = buatPesanWa(input, siapkan(input), pemesan);
    expect(pesan).toContain("📦 Paket      : Lepas kunci (maks. 12 jam, tanpa sopir)");
    expect(pesan).toContain("Serah terima : Area 2 — Tondano (Minahasa), Kota Tomohon, Likupang, Bitung");
    expect(pesan).toContain("• Sewa Rp 500.000 × 2 hari = Rp 1.000.000");
    expect(pesan).toContain("• Antar-jemput Area 2 = Rp 300.000");
    expect(pesan).toContain("💰 Est. Total : Rp 1.300.000");
    expect(pesan).toContain("📅 Tanggal    : 2026-10-30 s/d 2026-10-31");
    expect(pesan).toContain("✅ Menyetujui Syarat & Ketentuan versi 1 Oktober 2026");
    expect(pesan).not.toContain("Pesona");
  });

  it("menandai biaya yang dikonfirmasi", () => {
    const input: InputBooking = { car: xpander, paket: "full_day", jumlah: 1, area: 4 };
    const pesan = buatPesanWa(input, siapkan(input), pemesan);
    expect(pesan).toContain("• Biaya area: dikonfirmasi");
    expect(pesan).toContain("Rp 850.000 + biaya yang dikonfirmasi");
  });
});
