import { describe, it, expect } from "vitest";
import { fill, formatTanggal } from "./format";

describe("fill", () => {
  it("mengganti placeholder dan membiarkan yang tidak dikenal", () => {
    expect(fill("Mulai {price}/hari", { price: "Rp 700.000" })).toBe("Mulai Rp 700.000/hari");
    expect(fill("Area {n} {x}", { n: 2 })).toBe("Area 2 {x}");
  });
});

describe("formatTanggal", () => {
  it("menulis tanggal panjang per bahasa tanpa bergeser hari", () => {
    expect(formatTanggal("2026-10-01", "id")).toBe("1 Oktober 2026");
    expect(formatTanggal("2026-10-01", "en")).toBe("October 1, 2026");
    expect(formatTanggal("2026-10-01", "zh")).toBe("2026年10月1日");
    expect(formatTanggal("2026-10-01", "ko")).toBe("2026년 10월 1일");
  });
});
