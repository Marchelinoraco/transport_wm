import { describe, it, expect } from "vitest";
import { businessJsonLd, MAIN_SITE_URL, SOSMED_URL, MAPS_URL } from "./site";

describe("businessJsonLd", () => {
  it("rentang harga mengikuti daftar harga 1 Okt 2026 (transfer Avanza s/d Full day Alphard 2022–2026)", () => {
    expect(businessJsonLd.priceRange).toBe("Rp 300.000 - Rp 4.000.000");
  });

  // Google mencocokkan nama-alamat-telepon (NAP) di situs dengan Google
  // Business Profile. Alamat tanpa jalan & kode pos melemahkan pencocokan itu.
  it("alamat lengkap sama dengan alamat di footer & invoice", () => {
    expect(businessJsonLd.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Grha Merdeka, Jl. AA. Maramis No. 17, Kairagi Dua",
      addressLocality: "Manado",
      addressRegion: "Sulawesi Utara",
      postalCode: "95254",
      addressCountry: "ID",
    });
  });

  it("nama badan hukum adalah PT, bukan nama merek", () => {
    expect(businessJsonLd.legalName).toBe("PT. Welcome Manado Wisata");
    expect(businessJsonLd.name).toBe("Welcome Manado Transport");
  });

  it("sameAs berisi profil sosial resmi, bukan link chat WhatsApp", () => {
    expect(businessJsonLd.sameAs).toEqual([
      SOSMED_URL.instagram,
      SOSMED_URL.facebook,
      SOSMED_URL.tiktok,
    ]);
    expect(businessJsonLd.sameAs.some((u) => u.includes("wa.me"))).toBe(false);
  });

  it("menautkan peta Google, email, dan situs induk Welcome Manado", () => {
    expect(businessJsonLd.hasMap).toBe(MAPS_URL);
    expect(businessJsonLd.email).toBe("info@welcomemanado.com");
    expect(businessJsonLd.parentOrganization).toEqual({
      "@type": "TravelAgency",
      name: "PT. Welcome Manado Wisata",
      url: MAIN_SITE_URL,
    });
  });
});
