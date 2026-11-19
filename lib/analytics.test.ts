import { describe, it, expect, vi } from "vitest";
import {
  gaIdValid,
  pilihGaId,
  GA_ID_BAWAAN,
  verifikasiGoogle,
  apakahLinkWhatsapp,
  catatKlikWhatsapp,
} from "./analytics";

describe("gaIdValid", () => {
  it("menerima Measurement ID GA4 dan membuang spasi", () => {
    expect(gaIdValid(" G-AB12CD34EF ")).toBe("G-AB12CD34EF");
  });

  it("kosong atau tidak terisi = Analytics tidak dipasang", () => {
    expect(gaIdValid(undefined)).toBeNull();
    expect(gaIdValid("")).toBeNull();
    expect(gaIdValid("   ")).toBeNull();
  });

  it("menolak nilai yang bukan ID GA4 — nilainya ditempel ke dalam <script>", () => {
    expect(gaIdValid("UA-12345-1")).toBeNull();
    expect(gaIdValid("G-ABC');alert(1);//")).toBeNull();
  });
});

describe("pilihGaId", () => {
  it("build produksi tanpa env var memakai ID properti Welcome Manado Transport", () => {
    expect(pilihGaId(undefined, "production")).toBe(GA_ID_BAWAAN);
    expect(GA_ID_BAWAAN).toBe("G-67TC24X338");
  });

  it("next dev / test tidak mengirim data ke GA (tidak mengotori laporan)", () => {
    expect(pilihGaId(undefined, "development")).toBeNull();
    expect(pilihGaId(undefined, "test")).toBeNull();
  });

  it("NEXT_PUBLIC_GA_ID di Vercel menang; diisi kosong = Analytics dimatikan", () => {
    expect(pilihGaId("G-LAIN12345", "production")).toBe("G-LAIN12345");
    expect(pilihGaId("", "production")).toBeNull();
  });
});

describe("verifikasiGoogle", () => {
  it("mengembalikan token Search Console tanpa spasi", () => {
    expect(verifikasiGoogle(" abcDEF_123-xyz ")).toBe("abcDEF_123-xyz");
  });

  it("tidak memasang meta bila env kosong atau isinya bukan token", () => {
    expect(verifikasiGoogle(undefined)).toBeUndefined();
    expect(verifikasiGoogle("")).toBeUndefined();
    expect(verifikasiGoogle('<meta name="google-site-verification" content="abc">')).toBeUndefined();
  });
});

describe("apakahLinkWhatsapp", () => {
  it("mengenali semua bentuk link WhatsApp", () => {
    expect(apakahLinkWhatsapp("https://wa.me/6282173738822?text=Halo")).toBe(true);
    expect(apakahLinkWhatsapp("https://api.whatsapp.com/send?phone=62821")).toBe(true);
    expect(apakahLinkWhatsapp("whatsapp://send?phone=62821")).toBe(true);
  });

  it("link lain tidak dihitung", () => {
    expect(apakahLinkWhatsapp("https://instagram.com/welcomemanadotours")).toBe(false);
    expect(apakahLinkWhatsapp("https://transport.welcomemanado.com/katalog")).toBe(false);
    expect(apakahLinkWhatsapp("tel:+6282173738822")).toBe(false);
    expect(apakahLinkWhatsapp(null)).toBe(false);
    expect(apakahLinkWhatsapp("")).toBe(false);
  });
});

describe("catatKlikWhatsapp", () => {
  it("mengirim event klik_whatsapp beserta halaman asalnya ke GA4", () => {
    const gtag = vi.fn();
    expect(catatKlikWhatsapp("/mobil/toyota-avanza", gtag)).toBe(true);
    expect(gtag).toHaveBeenCalledWith("event", "klik_whatsapp", {
      halaman: "/mobil/toyota-avanza",
    });
  });

  it("diam saja bila Analytics belum terpasang — tombol WhatsApp tetap jalan", () => {
    expect(catatKlikWhatsapp("/", undefined)).toBe(false);
  });
});
