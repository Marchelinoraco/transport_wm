import { describe, it, expect } from "vitest";
import { mobil } from "./test/mobil";
import { unitCocok, daftarNama, rpSingkat, unitLepasKunci, hargaLepasKunciMulai, paragrafPaketDenganSopir, paragrafBiayaArea } from "./landing";

// Harga sesuai admin per 19 Nov 2026.
const brio = mobil({ id: 17, name: "Honda Brio", slug: "honda-brio", price_rent: 0, price_transfer: null, price_overtime: null, price_self_drive: 350_000 });
const agya = mobil({ id: 18, name: "Toyota Agya", slug: "toyota-agya", price_rent: 0, price_transfer: null, price_overtime: null, price_self_drive: 350_000 });
const avanza = mobil();
const alphardLama = mobil({ id: 10, name: "Toyota Alphard (2019–2022)", slug: "toyota-alphard", price_rent: 3_500_000, price_self_drive: null });
const alphardBaru = mobil({ id: 14, name: "Toyota Alphard (2022–2026)", slug: "toyota-alphard-2022-2026", price_rent: 4_000_000, price_self_drive: null });

describe("unitCocok", () => {
  it("memilih unit menurut nama dan mengurutkan dari yang termurah", () => {
    expect(unitCocok([alphardBaru, avanza, alphardLama], /alphard/i)).toEqual([alphardLama, alphardBaru]);
  });
});

describe("daftarNama", () => {
  it("menyusun daftar bahasa Indonesia yang wajar", () => {
    expect(daftarNama([])).toBe("");
    expect(daftarNama(["Avanza"])).toBe("Avanza");
    expect(daftarNama(["Brio", "Agya"])).toBe("Brio dan Agya");
    expect(daftarNama(["Brio", "Agya", "Avanza"])).toBe("Brio, Agya, dan Avanza");
  });
});

describe("rpSingkat", () => {
  it("menulis harga ringkas untuk judul di Google", () => {
    expect(rpSingkat(350_000)).toBe("Rp 350 Ribu");
    expect(rpSingkat(1_500_000)).toBe("Rp 1,5 Juta");
    expect(rpSingkat(3_000_000)).toBe("Rp 3 Juta");
    expect(rpSingkat(1_250_000)).toBe("Rp 1,25 Juta");
  });
});

describe("unit lepas kunci", () => {
  it("hanya unit yang punya harga lepas kunci, termurah di depan", () => {
    expect(unitLepasKunci([alphardLama, avanza, brio, agya]).map((c) => c.name)).toEqual(["Honda Brio", "Toyota Agya", "Toyota Avanza"]);
  });

  it("harga lepas kunci termurah, atau null bila tidak ada", () => {
    expect(hargaLepasKunciMulai([avanza, brio])).toBe(350_000);
    expect(hargaLepasKunciMulai([alphardLama])).toBeNull();
  });

  it("unit yang sedang disewa tidak ikut menentukan harga mulai", () => {
    expect(hargaLepasKunciMulai([{ ...brio, status: "disewa" }, avanza])).toBe(400_000);
  });
});

describe("paragraf bersama landing unit bersopir", () => {
  it("isi paket Full day diambil dari tarif resmi (120 km, parkir Rp 50.000)", () => {
    const p = paragrafPaketDenganSopir("Alphard");
    expect(p).toContain("BBM sampai 120 km per hari");
    expect(p).toContain("parkir sampai Rp 50.000 per hari");
    expect(p).toContain("Alphard hanya disewakan dengan sopir, tidak lepas kunci.");
  });

  it("Biaya Area menyebut wilayah Area 2 dan menaut ke Syarat & Ketentuan", () => {
    const p = paragrafBiayaArea();
    expect(p).toContain("Tondano (Minahasa), Kota Tomohon, Likupang, Bitung");
    expect(p).toContain("(/syarat-ketentuan)");
  });
});
