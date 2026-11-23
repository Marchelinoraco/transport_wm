import { describe, it, expect } from "vitest";
import { menuUtama } from "./menuUtama";
import { dictionaries, locales } from "./i18n/dictionaries";

describe("menuUtama", () => {
  it.each(locales)("%s: Syarat & Ketentuan ada di deretan menu utama, setelah Tentang", (l) => {
    const href = menuUtama(dictionaries[l], "notch").map((m) => m.href);
    expect(href).toEqual(["/", "/katalog", "/promo", "/blog", "/tentang", "/syarat-ketentuan"]);
  });

  it("notch memakai label pendek, panel HP memakai label lengkap", () => {
    const d = dictionaries.id;
    expect(menuUtama(d, "notch").at(-1)!.label).toBe("Syarat");
    expect(menuUtama(d, "panel").at(-1)!.label).toBe("Syarat & Ketentuan");
  });

  it.each(locales)("%s: label pendek tidak kosong dan tidak lebih panjang dari label lengkap", (l) => {
    const d = dictionaries[l];
    expect(d.nav.termsShort.trim()).not.toBe("");
    expect(d.nav.termsShort.length).toBeLessThanOrEqual(d.nav.terms.length);
  });
});
