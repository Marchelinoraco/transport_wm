import { describe, it, expect } from "vitest";
import { SYARAT_KETENTUAN, SYARAT_BERLAKU_SEJAK } from "./syarat-ketentuan";
import { RINGKASAN_PAKET } from "./ringkasan-paket";
import { locales } from "./i18n/dictionaries";
import { PAKET } from "./paket";

describe("SYARAT_KETENTUAN", () => {
  it("berlaku sejak 1 Oktober 2026", () => {
    expect(SYARAT_BERLAKU_SEJAK).toBe("2026-10-01");
  });

  it("setiap pasal lengkap 4 bahasa dengan jumlah butir yang sama", () => {
    for (const b of SYARAT_KETENTUAN) {
      for (const l of locales) {
        expect(b.judul[l].trim(), `${b.id}.judul.${l}`).not.toBe("");
        expect(b.isi[l].length, `${b.id}.isi.${l}`).toBe(b.isi.id.length);
        for (const butir of b.isi[l]) expect(butir.trim()).not.toBe("");
      }
    }
  });

  it("anchor unik, tanpa pasal paket wisata, ada pasal paket", () => {
    const ids = SYARAT_KETENTUAN.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("tur");
    expect(ids).toContain("paket");
  });

  it("operator Welcome Manado, istilah 'Pelayanan' tidak dipakai", () => {
    const teks = JSON.stringify(SYARAT_KETENTUAN);
    expect(teks).not.toContain("Pesona");
    expect(teks).not.toContain("Pelayanan");
    expect(teks).toContain("Welcome Manado");
  });

  it("keterlambatan lepas kunci Rp 100.000 per jam, bukan satu hari penuh", () => {
    const telat = SYARAT_KETENTUAN.find((b) => b.id === "keterlambatan")!;
    expect(telat.isi.id[0]).toContain("Rp 100.000 per jam");
    expect(JSON.stringify(telat)).not.toContain("satu hari penuh");
  });

  it("pasal pengemudi menyebut batas 12 jam dan over time per unit", () => {
    const sopir = SYARAT_KETENTUAN.find((b) => b.id === "pengemudi")!;
    expect(sopir.isi.id.join(" ")).toContain("12 jam");
    expect(sopir.isi.id.join(" ")).toContain("over time");
  });
});

describe("RINGKASAN_PAKET", () => {
  it.each(PAKET)("%s lengkap 4 bahasa dengan jumlah butir sama", (p) => {
    for (const l of locales) {
      expect(RINGKASAN_PAKET[p].termasuk[l].length).toBe(RINGKASAN_PAKET[p].termasuk.id.length);
      expect(RINGKASAN_PAKET[p].tidakTermasuk[l].length).toBe(RINGKASAN_PAKET[p].tidakTermasuk.id.length);
    }
  });

  it("isi sesuai paket", () => {
    expect(RINGKASAN_PAKET.full_day.termasuk.id.join(" ")).toContain("sopir");
    expect(RINGKASAN_PAKET.full_day.tidakTermasuk.id.join(" ")).toContain("Tiket masuk tempat wisata");
    expect(RINGKASAN_PAKET.self_drive.tidakTermasuk.id).toContain("Bahan bakar");
    expect(RINGKASAN_PAKET.self_drive.tidakTermasuk.id.join(" ")).toContain("Rp 100.000 per jam");
  });
});
