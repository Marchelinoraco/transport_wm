import { describe, it, expect } from "vitest";
import { RINGKASAN_SYARAT, IKON_PASAL } from "./syarat-ringkasan";
import { SYARAT_KETENTUAN } from "./syarat-ketentuan";
import { locales } from "./i18n/dictionaries";
import { TARIF_LEPAS_KUNCI } from "./tarif-sewa";

describe("RINGKASAN_SYARAT", () => {
  it("lima butir ringkasan, lengkap 4 bahasa", () => {
    expect(RINGKASAN_SYARAT).toHaveLength(5);
    for (const r of RINGKASAN_SYARAT) {
      for (const l of locales) {
        expect(r.judul[l].trim()).not.toBe("");
        expect(r.nilai[l].trim()).not.toBe("");
      }
    }
  });

  it("setiap butir menaut ke pasal yang benar-benar ada", () => {
    const ada = new Set(SYARAT_KETENTUAN.map((b) => b.id));
    for (const r of RINGKASAN_SYARAT) expect(ada.has(r.pasal)).toBe(true);
  });

  it("denda telat dan batas km diambil dari tarif, bukan ditulis ulang", () => {
    const telat = RINGKASAN_SYARAT.find((r) => r.pasal === "keterlambatan")!;
    expect(telat.nilai.id).toContain("100.000");
    expect(telat.nilai.en).toContain("100,000");
    expect(telat.nilai.id).toContain(String(TARIF_LEPAS_KUNCI.keterlambatanPerJam / 1000));
    const batas = RINGKASAN_SYARAT.find((r) => r.pasal === "paket")!;
    expect(batas.nilai.id).toContain(String(TARIF_LEPAS_KUNCI.batasKmPerHari));
  });
});

describe("IKON_PASAL", () => {
  it("setiap pasal S&K punya ikon, sehingga pasal baru tidak lolos tanpa ikon", () => {
    for (const b of SYARAT_KETENTUAN) expect(IKON_PASAL[b.id], b.id).toBeTruthy();
  });
});
