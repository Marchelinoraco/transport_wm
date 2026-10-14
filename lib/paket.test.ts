import { describe, it, expect } from "vitest";
import { adaHarga, golonganMesin, hargaMulai, hargaPaket, paketTersedia } from "./paket";
import { mobil } from "./test/mobil";

describe("paketTersedia", () => {
  it("hanya paket yang harganya > 0, urut full_day, transfer, self_drive", () => {
    expect(paketTersedia(mobil())).toEqual(["full_day", "transfer", "self_drive"]);
    expect(paketTersedia(mobil({ price_self_drive: null }))).toEqual(["full_day", "transfer"]);
  });

  it("unit tanpa harga sama sekali (mis. White Marlin) tidak punya paket", () => {
    expect(paketTersedia(mobil({ price_rent: 0, price_transfer: null, price_self_drive: null }))).toEqual([]);
  });
});

describe("hargaPaket & adaHarga", () => {
  it("0 dan null dianggap tidak ada harga", () => {
    expect(hargaPaket(mobil({ price_rent: 0 }), "full_day")).toBeNull();
    expect(hargaPaket(mobil(), "transfer")).toBe(300_000);
    expect(adaHarga(0)).toBe(false);
    expect(adaHarga(null)).toBe(false);
    expect(adaHarga(1)).toBe(true);
  });
});

describe("golonganMesin", () => {
  it("≤ 2000 cc kecil, > 2000 cc besar, kosong tidak diketahui", () => {
    expect(golonganMesin(1998)).toBe("kecil");
    expect(golonganMesin(2000)).toBe("kecil");
    expect(golonganMesin(2001)).toBe("besar");
    expect(golonganMesin(null)).toBeNull();
  });
});

describe("hargaMulai", () => {
  it("Full day termurah di antara unit tersedia yang berharga", () => {
    const daftar = [
      mobil({ price_rent: 3_500_000 }),
      mobil({ price_rent: 700_000 }),
      mobil({ price_rent: 0 }),
      mobil({ price_rent: 500_000, status: "disewa" }),
    ];
    expect(hargaMulai(daftar)).toBe(700_000);
  });

  it("tanpa unit berharga hasilnya null, bukan 0", () => {
    expect(hargaMulai([])).toBeNull();
    expect(hargaMulai([mobil({ price_rent: 0 })])).toBeNull();
  });
});
