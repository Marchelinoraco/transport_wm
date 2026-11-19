import { describe, it, expect } from "vitest";
import { mobil } from "./test/mobil";
import { unitAlphard, deskripsiAlphard } from "./alphard";

// Harga sesuai admin per 19 Nov 2026.
const lama = mobil({ id: 10, name: "Toyota Alphard (2019–2022)", slug: "toyota-alphard", type: "MPV premium", price_rent: 3_500_000, price_transfer: 1_500_000, price_self_drive: null, engine_cc: 2500 });
const baru = mobil({ id: 14, name: "Toyota Alphard (2022–2026)", slug: "toyota-alphard-2022-2026", type: "MPV premium", price_rent: 4_000_000, price_transfer: 2_500_000, price_self_drive: null, engine_cc: 2500 });

describe("unitAlphard", () => {
  it("hanya Alphard, yang lebih terjangkau di depan", () => {
    expect(unitAlphard([baru, mobil(), lama])).toEqual([lama, baru]);
  });
});

describe("deskripsiAlphard", () => {
  it("menyebut harga Full day termurah dari data armada dan muat di hasil Google", () => {
    const d = deskripsiAlphard([baru, lama]);
    expect(d).toContain("Rp 3.500.000/hari");
    expect(d.length).toBeLessThanOrEqual(160);
  });

  it("tanpa angka bila harga tidak terbaca — tidak pernah menebak", () => {
    const d = deskripsiAlphard([]);
    expect(d).not.toMatch(/Rp/);
    expect(d.length).toBeLessThanOrEqual(160);
  });
});
