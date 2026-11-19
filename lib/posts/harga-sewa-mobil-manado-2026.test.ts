import { describe, it, expect } from "vitest";
import { post } from "./harga-sewa-mobil-manado-2026";

type Tabel = { type: "table"; headers: string[]; rows: string[][] };

const tabel = post.body.find((b): b is Tabel => b.type === "table")!;
const kolom = (judul: RegExp) => tabel.headers.findIndex((h) => judul.test(h));
const rupiah = (sel: string) => (sel.startsWith("Rp") ? Number(sel.replace(/\D/g, "")) : null);

// Artikel dengan tayangan terbanyak di Search Console (330 tayangan, posisi ±7)
// tetapi CTR-nya hanya 1,8% — judul & deskripsi di hasil Google yang dijaga di sini.
describe("artikel harga sewa mobil Manado", () => {
  it("judul di Google memuat harga termurah per hari yang benar menurut tabel", () => {
    const perHari = [kolom(/^Full day/), kolom(/^Lepas kunci/)];
    const termurah = Math.min(
      ...tabel.rows.flatMap((r) => perHari.map((i) => rupiah(r[i]))).filter((n): n is number => n !== null)
    );
    expect(termurah).toBe(350_000);
    expect(post.metaTitle).toContain("Mulai Rp 350 Ribu/Hari");
  });

  it("judul & deskripsi muat tanpa terpotong di hasil Google", () => {
    // Template layout menambahkan " | Welcome Manado Transport"; bagian
    // pentingnya harus tetap terbaca di ±60 karakter pertama.
    expect((post.metaTitle ?? post.title).length).toBeLessThanOrEqual(60);
    expect(post.description.length).toBeLessThanOrEqual(160);
  });

  it("setiap unit di tabel menaut ke halaman mobilnya (internal link)", () => {
    for (const baris of tabel.rows) {
      expect(baris[0]).toMatch(/^\[[^\]]+\]\(\/mobil\/[a-z0-9-]+\)$/);
    }
  });

  it("memuat semua unit lepas kunci saja (Brio & Agya), bukan hanya unit bersopir", () => {
    const unit = tabel.rows.map((r) => r[0]);
    expect(unit).toContain("[Honda Brio](/mobil/honda-brio)");
    expect(unit).toContain("[Toyota Agya](/mobil/toyota-agya)");
  });

  it("menaut ke halaman sewa Hiace dan panduan bandara", () => {
    const teks = JSON.stringify(post.body);
    expect(teks).toContain("(/sewa-hiace-manado)");
    expect(teks).toContain("(/blog/sewa-mobil-bandara-sam-ratulangi)");
  });
});
