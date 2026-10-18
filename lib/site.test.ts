import { describe, it, expect } from "vitest";
import { businessJsonLd } from "./site";

describe("businessJsonLd", () => {
  it("rentang harga mengikuti daftar harga 1 Okt 2026 (transfer Avanza s/d Full day Alphard 2022–2026)", () => {
    expect(businessJsonLd.priceRange).toBe("Rp 300.000 - Rp 4.000.000");
  });
});
