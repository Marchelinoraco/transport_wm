import { describe, it, expect } from "vitest";
import { langFromSearch, urlWithoutLang } from "./lang-param";

describe("langFromSearch", () => {
  it("memakai bahasa dari ?lang= bila termasuk 4 bahasa situs", () => {
    expect(langFromSearch("?lang=en")).toBe("en");
    expect(langFromSearch("?lang=ko&utm=x")).toBe("ko");
    expect(langFromSearch("?lang=id")).toBe("id");
  });

  it("mengabaikan nilai yang bukan kode bahasa situs (persis, peka huruf)", () => {
    expect(langFromSearch("?lang=FR")).toBeNull();
    expect(langFromSearch("?lang=xx")).toBeNull();
    expect(langFromSearch("?lang=")).toBeNull();
    expect(langFromSearch("")).toBeNull();
  });
});

describe("urlWithoutLang", () => {
  it("membuang lang dan tanda tanya yang tersisa", () => {
    expect(urlWithoutLang("https://t.co/?lang=en")).toBe("https://t.co/");
  });

  it("mempertahankan parameter lain dan hash", () => {
    expect(urlWithoutLang("https://t.co/katalog?lang=en&utm=a#top")).toBe("https://t.co/katalog?utm=a#top");
  });

  it("URL tanpa lang tidak berubah", () => {
    expect(urlWithoutLang("https://t.co/?utm=a")).toBe("https://t.co/?utm=a");
  });
});
