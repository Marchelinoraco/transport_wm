import { describe, it, expect } from "vitest";
import { mobil } from "./test/mobil";
import { unitHiace, deskripsiHiace } from "./hiace";

// Harga sesuai admin per 19 Nov 2026.
const commuter = mobil({ id: 8, name: "Toyota Hiace Commuter 14 pax", slug: "hiace-commuter", type: "Mini Bus", price_rent: 1_500_000, price_self_drive: null, engine_cc: 2500, seats: 14 });
const premio = mobil({ id: 11, name: "Toyota Hiace Premio 14 pax (2023)", slug: "hiace-premio", type: "Mini Bus", price_rent: 2_000_000, price_self_drive: null, engine_cc: 2800, seats: 14 });
const bus = mobil({ id: 9, name: "Bus 30 Seat", slug: "bus-3033-seater", type: "Bus", price_rent: 2_300_000, seats: 30 });
const avanza = mobil();

describe("unitHiace", () => {
  it("hanya unit Hiace yang tampil, dikenali dari namanya — unit Hiace baru otomatis ikut", () => {
    expect(unitHiace([avanza, premio, bus, commuter])).toEqual([commuter, premio]);
    expect(unitHiace([mobil({ name: "Toyota HIACE Luxury" })])).toHaveLength(1);
  });

  it("urut dari yang termurah supaya Commuter (paling hemat) di depan", () => {
    expect(unitHiace([premio, commuter]).map((c) => c.slug)).toEqual(["hiace-commuter", "hiace-premio"]);
  });

  it("kosong bila armada tidak punya Hiace", () => {
    expect(unitHiace([avanza, bus])).toEqual([]);
  });
});

describe("deskripsiHiace", () => {
  it("menyebut harga Full day termurah dari data armada, bukan angka tertulis", () => {
    const d = deskripsiHiace([premio, commuter]);
    expect(d).toContain("Rp 1.500.000/hari");
    expect(d.length).toBeLessThanOrEqual(160);
  });

  it("ikut berubah bila harga di admin berubah", () => {
    expect(deskripsiHiace([{ ...commuter, price_rent: 1_650_000 }])).toContain("Rp 1.650.000/hari");
  });

  it("tanpa angka bila harga tidak terbaca (API gagal) — tidak pernah menebak", () => {
    const d = deskripsiHiace([]);
    expect(d).not.toMatch(/Rp/);
    expect(d.length).toBeLessThanOrEqual(160);
  });
});
