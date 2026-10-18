import { describe, it, expect } from "vitest";
import { mobilSerupa } from "./mobilSerupa";
import { mobil } from "./test/mobil";

const ini = mobil({ id: 1, price_rent: 700_000 });
const armada = [
  ini,
  mobil({ id: 2, price_rent: 850_000 }),
  mobil({ id: 3, price_rent: 1_000_000 }),
  mobil({ id: 4, price_rent: 1_250_000 }),
  mobil({ id: 5, price_rent: 2_000_000 }),
  mobil({ id: 6, price_rent: 4_000_000 }),
  mobil({ id: 7, price_rent: 0 }),
];
const id = (cs: { id: number }[]) => cs.map((c) => c.id);

describe("mobilSerupa", () => {
  it("empat unit dengan harga Full day terdekat, tanpa mobil itu sendiri dan tanpa unit tanpa harga", () => {
    expect(id(mobilSerupa(ini, armada))).toEqual([2, 3, 4, 5]);
  });

  it("selisih sama: id lebih kecil lebih dulu", () => {
    const pusat = mobil({ id: 10, price_rent: 1_000_000 });
    expect(id(mobilSerupa(pusat, [pusat, mobil({ id: 12, price_rent: 1_100_000 }), mobil({ id: 11, price_rent: 900_000 })]))).toEqual([11, 12]);
  });

  it("menghormati batas maks", () => {
    expect(mobilSerupa(ini, armada, 2)).toHaveLength(2);
  });

  it("mobil tanpa harga mendapat empat unit termurah yang berharga", () => {
    const kapal = mobil({ id: 13, price_rent: 0, price_transfer: null, price_self_drive: null });
    expect(id(mobilSerupa(kapal, [...armada, kapal]))).toEqual([1, 2, 3, 4]);
  });

  it("armada yang hanya berisi mobil itu sendiri menghasilkan daftar kosong", () => {
    expect(mobilSerupa(ini, [ini])).toEqual([]);
  });
});
