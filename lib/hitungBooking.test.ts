import { describe, it, expect } from "vitest";
import { areaUntukPaket, hitungBooking, normalisasiJumlah } from "./hitungBooking";
import { mobil } from "./test/mobil";

const avanza = mobil();
const alphard2019 = mobil({ name: "Toyota Alphard (2019–2022)", price_rent: 3_500_000, price_transfer: 1_500_000, price_overtime: 250_000, price_self_drive: null, engine_cc: 2500 });
const xpander = mobil({ name: "Mitsubishi Xpander", price_rent: 850_000, price_transfer: 350_000, price_self_drive: 500_000, engine_cc: 1499 });
const reborn = mobil({ name: "Toyota Innova Reborn (2019–2022)", price_rent: 1_000_000, price_transfer: 400_000, price_self_drive: 600_000, engine_cc: 1998 });
const premio = mobil({ name: "Toyota Hiace Premio 14 pax (2023)", price_rent: 2_000_000, price_transfer: 800_000, price_self_drive: null, engine_cc: 2800 });
const fortuner = mobil({ name: "Toyota Fortuner (2020–2023)", price_rent: 2_500_000, price_transfer: 1_000_000, price_self_drive: null, engine_cc: 2400 });

describe("hitungBooking — contoh di spec", () => {
  it("Avanza Full day 3 hari Area 2 = 2.550.000", () => {
    expect(hitungBooking({ car: avanza, paket: "full_day", jumlah: 3, area: 2 })?.total).toBe(2_550_000);
  });
  it("Alphard 2019 Full day 2 hari Area 3 = 7.700.000", () => {
    expect(hitungBooking({ car: alphard2019, paket: "full_day", jumlah: 2, area: 3 })?.total).toBe(7_700_000);
  });
  it("Xpander Lepas kunci 2 hari antar Area 2 = 1.300.000 (antar-jemput sekali)", () => {
    const h = hitungBooking({ car: xpander, paket: "self_drive", jumlah: 2, area: 2 });
    expect(h?.biayaTambahan).toBe(300_000);
    expect(h?.total).toBe(1_300_000);
  });
  it("Innova Reborn Lepas kunci 1 hari ambil di pool = 600.000", () => {
    expect(hitungBooking({ car: reborn, paket: "self_drive", jumlah: 1, area: "pool" })?.total).toBe(600_000);
  });
  it("Hiace Premio Transfer 2 trip = 1.600.000", () => {
    expect(hitungBooking({ car: premio, paket: "transfer", jumlah: 2, area: 1 })?.total).toBe(1_600_000);
  });
  it("Fortuner Full day Area 4 = 2.500.000 + biaya area dikonfirmasi", () => {
    const h = hitungBooking({ car: fortuner, paket: "full_day", jumlah: 1, area: 4 });
    expect(h?.total).toBe(2_500_000);
    expect(h?.dikonfirmasi).toBe(true);
    expect(h?.jenisTambahan).toBe("area");
  });
});

describe("hitungBooking — batas", () => {
  it("Area 1 Full day tanpa biaya tambahan", () => {
    const h = hitungBooking({ car: avanza, paket: "full_day", jumlah: 2, area: 1 });
    expect(h).toMatchObject({ sewa: 1_400_000, biayaTambahan: 0, jenisTambahan: null, dikonfirmasi: false, total: 1_400_000 });
  });
  it("cc kosong di luar Area 1 → biaya area dikonfirmasi, tidak ditebak", () => {
    const h = hitungBooking({ car: mobil({ engine_cc: null }), paket: "full_day", jumlah: 1, area: 2 });
    expect(h).toMatchObject({ biayaTambahan: 0, dikonfirmasi: true, total: 700_000 });
  });
  it("Transfer ke luar Area 1 → dikonfirmasi, tanpa biaya otomatis", () => {
    const h = hitungBooking({ car: avanza, paket: "transfer", jumlah: 1, area: 3 });
    expect(h).toMatchObject({ biayaTambahan: 0, dikonfirmasi: true, total: 300_000 });
  });
  it("Lepas kunci antar Area 4 → dikonfirmasi", () => {
    const h = hitungBooking({ car: avanza, paket: "self_drive", jumlah: 1, area: 4 });
    expect(h).toMatchObject({ jenisTambahan: "antar", biayaTambahan: 0, dikonfirmasi: true, total: 400_000 });
  });
  it("paket yang tidak tersedia menghasilkan null", () => {
    expect(hitungBooking({ car: alphard2019, paket: "self_drive", jumlah: 1, area: "pool" })).toBeNull();
  });
});

describe("normalisasiJumlah", () => {
  it("kosong, 0, negatif, pecahan, dan angka raksasa dijepit ke 1..365", () => {
    expect(normalisasiJumlah(Number(""))).toBe(1);
    expect(normalisasiJumlah(NaN)).toBe(1);
    expect(normalisasiJumlah(0)).toBe(1);
    expect(normalisasiJumlah(-3)).toBe(1);
    expect(normalisasiJumlah(2.7)).toBe(2);
    expect(normalisasiJumlah(99999)).toBe(365);
  });
  it("hitungBooking memakai jumlah yang sudah dinormalisasi", () => {
    expect(hitungBooking({ car: avanza, paket: "full_day", jumlah: 0, area: 1 })?.total).toBe(700_000);
  });
});

describe("areaUntukPaket", () => {
  it("pool hanya sah untuk lepas kunci; pindah ke lepas kunci selalu ke pool", () => {
    expect(areaUntukPaket("pool", "full_day")).toBe(1);
    expect(areaUntukPaket("pool", "transfer")).toBe(1);
    expect(areaUntukPaket(2, "self_drive")).toBe("pool");
    expect(areaUntukPaket(3, "full_day")).toBe(3);
    expect(areaUntukPaket("pool", "self_drive")).toBe("pool");
  });
});
