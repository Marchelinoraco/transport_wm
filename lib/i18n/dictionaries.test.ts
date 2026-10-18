import { describe, it, expect } from "vitest";
import { dictionaries, locales } from "./dictionaries";

type Pohon = string | Pohon[] | { [k: string]: Pohon };

function daun(nilai: Pohon, jalur = ""): [string, string][] {
  if (typeof nilai === "string") return [[jalur, nilai]];
  if (Array.isArray(nilai)) return nilai.flatMap((v, i) => daun(v, `${jalur}[${i}]`));
  return Object.entries(nilai).flatMap(([k, v]) => daun(v, jalur ? `${jalur}.${k}` : k));
}

const placeholder = (s: string) => Array.from(s.matchAll(/\{(\w+)\}/g)).map((m) => m[1]).sort().join(",");

describe("kamus", () => {
  const acuan = new Map(daun(dictionaries.id as unknown as Pohon));

  it.each(locales)("%s: tidak ada teks kosong", (l) => {
    for (const [jalur, teks] of daun(dictionaries[l] as unknown as Pohon)) {
      expect(teks.trim(), `${l}.${jalur}`).not.toBe("");
    }
  });

  it.each(locales)("%s: placeholder sama dengan bahasa Indonesia", (l) => {
    for (const [jalur, teks] of daun(dictionaries[l] as unknown as Pohon)) {
      expect(placeholder(teks), `${l}.${jalur}`).toBe(placeholder(acuan.get(jalur) ?? ""));
    }
  });

  it("memuat bagian baru untuk paket, area, dan S&K", () => {
    expect(dictionaries.id.paket.priceChip).toContain("{price}");
    expect(dictionaries.id.paket.validSince).toContain("{date}");
    expect(dictionaries.id.area.areaFee).toContain("{n}");
    expect(dictionaries.id.terms.effectiveSince).toContain("{date}");
  });
});
