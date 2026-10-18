import { describe, it, expect } from "vitest";
import { tabelBiayaArea } from "./biayaArea";
import { hitungBooking } from "./hitungBooking";
import { mobil } from "./test/mobil";

const avanza = mobil();
const alphard = mobil({ name: "Toyota Alphard (2019–2022)", price_rent: 3_500_000, price_transfer: 1_500_000, price_self_drive: null, engine_cc: 2500 });

describe("tabelBiayaArea", () => {
  it("Full day Avanza (1500 cc): Area 1 gratis, Area 2/3 tarif golongan kecil per hari, Area 4 dikonfirmasi", () => {
    expect(tabelBiayaArea(avanza, "full_day")).toEqual([
      { area: 1, status: "gratis", nominal: 0, perHari: true },
      { area: 2, status: "harga", nominal: 150_000, perHari: true },
      { area: 3, status: "harga", nominal: 250_000, perHari: true },
      { area: 4, status: "dikonfirmasi", nominal: null, perHari: true },
    ]);
  });

  it("Full day Alphard (2500 cc) memakai tarif golongan besar", () => {
    const t = tabelBiayaArea(alphard, "full_day")!;
    expect(t[1].nominal).toBe(250_000);
    expect(t[2].nominal).toBe(350_000);
  });

  it("cc kosong: Area 2 dan 3 dikonfirmasi, tidak ditebak", () => {
    const t = tabelBiayaArea(mobil({ engine_cc: null }), "full_day")!;
    expect(t[1].status).toBe("dikonfirmasi");
    expect(t[2].status).toBe("dikonfirmasi");
  });

  it("Lepas kunci: pool gratis, antar-jemput per area sekali per pemesanan", () => {
    expect(tabelBiayaArea(avanza, "self_drive")).toEqual([
      { area: "pool", status: "gratis", nominal: 0, perHari: false },
      { area: 1, status: "harga", nominal: 150_000, perHari: false },
      { area: 2, status: "harga", nominal: 300_000, perHari: false },
      { area: 3, status: "harga", nominal: 600_000, perHari: false },
      { area: 4, status: "dikonfirmasi", nominal: null, perHari: false },
    ]);
  });

  it("Transfer: Area 1 termasuk, Area 2–4 dikonfirmasi", () => {
    expect(tabelBiayaArea(avanza, "transfer")!.map((b) => b.status)).toEqual(["termasuk", "dikonfirmasi", "dikonfirmasi", "dikonfirmasi"]);
  });

  it("paket yang tidak tersedia menghasilkan null", () => {
    expect(tabelBiayaArea(alphard, "self_drive")).toBeNull();
  });

  it("setiap nominal sama dengan biaya tambahan hitungBooking (tabel dan total tidak pernah berbeda)", () => {
    for (const car of [avanza, alphard]) {
      for (const paket of ["full_day", "self_drive", "transfer"] as const) {
        for (const b of tabelBiayaArea(car, paket) ?? []) {
          if (b.status !== "harga") continue;
          expect(b.nominal).toBe(hitungBooking({ car, paket, jumlah: 1, area: b.area })!.biayaTambahan);
        }
      }
    }
  });
});
