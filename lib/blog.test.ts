import { describe, it, expect } from "vitest";
import { getAllPosts } from "./blog";
import { post as hargaPost } from "./posts/harga-sewa-mobil-manado-2026";

// Slug mobil yang benar = yang dipakai tabel artikel harga (salinan data admin).
// Artikel bandara sempat menaut ke /mobil/toyota-hiace-premio dan
// /mobil/toyota-innova-zenix-g — keduanya halaman "Mobil tidak ditemukan".
const slugMobil = new Set(
  JSON.stringify(hargaPost.body).match(/\(\/mobil\/[a-z0-9-]+\)/g)!.map((m) => m.slice(8, -1))
);

describe("link /mobil/ di artikel blog", () => {
  for (const post of getAllPosts()) {
    it(`${post.slug}: semua link mobil menuju slug yang ada`, () => {
      const slugs = (JSON.stringify(post.body).match(/\(\/mobil\/[a-z0-9-]+\)/g) ?? []).map((m) => m.slice(8, -1));
      for (const s of slugs) expect(slugMobil, `/mobil/${s} tidak dikenal`).toContain(s);
    });
  }
});

// Judul & deskripsi yang terlalu panjang dipotong Google ("…") sehingga bagian
// terpentingnya tidak terbaca. Template layout menambahkan " | Welcome Manado
// Transport" di belakang judul, jadi judul artikel sendiri dibatasi 60.
describe("semua artikel blog", () => {
  for (const post of getAllPosts()) {
    it(`${post.slug}: judul ≤ 60 dan deskripsi ≤ 160 karakter`, () => {
      expect((post.metaTitle ?? post.title).length).toBeLessThanOrEqual(60);
      expect(post.description.length).toBeLessThanOrEqual(160);
    });
  }
});
