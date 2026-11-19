import { describe, it, expect } from "vitest";
import { mobil } from "./test/mobil";
import { judulRental, deskripsiRental, paragrafHargaRental, kalimatLepasKunci } from "./rentalManado";

// Armada sesuai admin per 19 Nov 2026 (sebagian).
const brio = mobil({ id: 17, name: "Honda Brio", slug: "honda-brio", price_rent: 0, price_transfer: null, price_overtime: null, price_self_drive: 350_000 });
const agya = mobil({ id: 18, name: "Toyota Agya", slug: "toyota-agya", price_rent: 0, price_transfer: null, price_overtime: null, price_self_drive: 350_000 });
const avanza = mobil();
const xpander = mobil({ id: 16, name: "Mitsubishi Xpander", slug: "mitsubishi-xpander", price_rent: 850_000, price_self_drive: 500_000 });
const reborn = mobil({ id: 6, name: "Toyota Innova Reborn (2019–2022)", slug: "toyota-innova-reborn", price_rent: 1_000_000, price_self_drive: 600_000 });
const alphard = mobil({ id: 10, name: "Toyota Alphard (2019–2022)", slug: "toyota-alphard", price_rent: 3_500_000, price_self_drive: null });
const armada = [alphard, reborn, xpander, avanza, agya, brio];

// "rental mobil manado" posisi ±28 (Search Console 19 Nov 2026). Halaman lama
// menulis lepas kunci hanya untuk Avanza, Xpander, Innova Reborn — Brio & Agya
// (lepas kunci saja, Rp 350.000) terlewat. Kini semuanya dibaca dari armada.
describe("halaman /rental-mobil-manado", () => {
  it("judul menyebut harga termurah per hari dan muat di hasil Google", () => {
    const j = judulRental(armada);
    expect(j).toBe("Rental Mobil Manado Murah — Mulai Rp 350 Ribu/Hari");
    expect(j.length).toBeLessThanOrEqual(60);
  });

  it("deskripsi menyebut harga lepas kunci & dengan sopir termurah, ≤ 160 karakter", () => {
    const d = deskripsiRental(armada);
    expect(d).toContain("Rp 350.000/hari lepas kunci");
    expect(d).toContain("Rp 700.000/hari dengan sopir");
    expect(d.length).toBeLessThanOrEqual(160);
  });

  it("daftar lepas kunci mengikuti armada, termasuk Brio & Agya", () => {
    expect(kalimatLepasKunci(armada)).toBe(
      "Lepas kunci tersedia untuk Honda Brio, Toyota Agya, Toyota Avanza, Mitsubishi Xpander, dan Toyota Innova Reborn (2019–2022)."
    );
  });

  it("paragraf harga menaut ke daftar harga lengkap", () => {
    const p = paragrafHargaRental(armada);
    expect(p).toContain("mulai **Rp 350.000 per hari**");
    expect(p).toContain("mulai **Rp 700.000 per hari**");
    expect(p).toContain("(/blog/harga-sewa-mobil-manado-2026)");
  });

  it("tanpa data armada (API gagal) tidak menyebut angka apa pun", () => {
    expect(judulRental([])).toBe("Rental Mobil Manado Murah & Terpercaya");
    expect(deskripsiRental([])).not.toMatch(/Rp/);
    expect(paragrafHargaRental([])).not.toMatch(/Rp \d/);
    expect(kalimatLepasKunci([])).toBe("");
  });
});
