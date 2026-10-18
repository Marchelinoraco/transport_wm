import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const AKAR = fileURLToPath(new URL("..", import.meta.url));

function berkas(dir: string): string[] {
  return readdirSync(dir).flatMap((nama) => {
    const p = join(dir, nama);
    if (statSync(p).isDirectory()) return berkas(p);
    return /\.(ts|tsx)$/.test(nama) && !/\.test\.ts$/.test(nama) ? [p] : [];
  });
}

const SEMUA = ["app", "components", "lib"].flatMap((d) => berkas(join(AKAR, d)));

/**
 * Situs pernah menjanjikan diskon 10% mingguan / 20% bulanan dan memuat
 * tabel harga hasil estimasi. Janji itu tidak berlaku sejak daftar harga
 * 1 Okt 2026 — teks yang mengulanginya adalah janji palsu kepada pelanggan.
 */
describe("teks situs", () => {
  it.each([
    ["janji diskon 10%/20%", /\b(10|20)\s*%/],
    ["diskon otomatis", /diskon otomatis|otomatis diskon|automatic discount/i],
    ["nama operator lain", /Pesona Manado/],
  ])("tidak ada %s", (_, pola) => {
    const temuan = SEMUA.filter((p) => pola.test(readFileSync(p, "utf8"))).map((p) => p.replace(AKAR, ""));
    expect(temuan).toEqual([]);
  });
});
