import { describe, it, expect } from "vitest";
import { tambahRef } from "./whatsapp";

describe("tambahRef", () => {
  it("menambah baris Ref di bawah pesan", () => {
    expect(tambahRef("Halo", "TRN-45")).toBe("Halo\n\nRef: TRN-45");
  });

  it("tanpa ref (null atau kosong) pesan dikembalikan apa adanya", () => {
    expect(tambahRef("Halo", null)).toBe("Halo");
    expect(tambahRef("Halo", undefined)).toBe("Halo");
    expect(tambahRef("Halo", "")).toBe("Halo");
  });
});
