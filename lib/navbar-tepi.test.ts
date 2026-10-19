import { describe, it, expect } from "vitest";
import { jalurNotch, pusatKilau, offsetLapis, LAPIS_KILAU, DURASI_KILAU } from "./navbar-tepi";

describe("jalurNotch", () => {
  const d = jalurNotch({ lebar: 800, tinggi: 60, r: 22, rb: 26 });

  it("mulai di ujung kiri lengkung cekung kiri dan berakhir di ujung kanan lengkung cekung kanan", () => {
    expect(d.startsWith("M 0 0 A 22 22 0 0 1 22 22")).toBe(true);
    expect(d.endsWith("A 22 22 0 0 1 844 0")).toBe(true);
  });

  it("menelusuri sisi kiri, sudut bawah, bawah, dan sisi kanan", () => {
    expect(d).toContain("L 22 34");
    expect(d).toContain("A 26 26 0 0 0 48 60");
    expect(d).toContain("L 796 60");
    expect(d).toContain("A 26 26 0 0 0 822 34");
  });
});

describe("kilau", () => {
  it("pusat bergerak linear dari -M ke L+M lalu berulang", () => {
    expect(DURASI_KILAU).toBe(4200);
    expect(pusatKilau(0, 1000, 130)).toBe(-130);
    expect(pusatKilau(2100, 1000, 130)).toBe(500);
    expect(pusatKilau(4200, 1000, 130)).toBe(-130);
  });

  it("offset lapisan memusatkan dash di pusat kilau", () => {
    expect(offsetLapis(500, 100)).toBe(-450);
  });

  it("lima lapisan dengan inti putih di paling atas", () => {
    expect(LAPIS_KILAU).toHaveLength(5);
    expect(LAPIS_KILAU[4][2]).toBe("#fff");
  });
});
