// Konfigurasi terpusat situs — sumber kebenaran untuk URL & data bisnis (SEO/local SEO)
import { WA_NUMBER } from "./whatsapp";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://transport.welcomemanado.com";

/** Situs utama Welcome Manado (tour & travel). Situs ini khusus transport. */
export const MAIN_SITE_URL = "https://welcomemanado.com";

export const SITE = {
  name: "Welcome Manado Transport",
  legalName: "Welcome Manado Transport",
  url: SITE_URL,
  /** Deskripsi default untuk metadata & structured data */
  description:
    "Welcome Manado Transport — layanan rental mobil & transportasi terpercaya di Kota Manado, Sulawesi Utara. Paket Full day dengan sopir, transfer bandara, atau lepas kunci. Pesan mudah via WhatsApp.",
  city: "Manado",
  region: "Sulawesi Utara",
  regionCode: "ID-SA",
  country: "ID",
  /** Nomor WhatsApp bisnis dalam format internasional */
  whatsapp: WA_NUMBER,
  /** Untuk schema telephone (E.164) */
  telephone: `+${WA_NUMBER}`,
  /** Koordinat pusat layanan (Kota Manado) */
  geo: { lat: 1.4748, lng: 124.8421 },
  /** Area layanan untuk LocalBusiness areaServed */
  areaServed: ["Manado", "Tomohon", "Bitung", "Minahasa", "Likupang", "Airmadidi"],
  // Pakai endpoint OG dinamis bawaan Next (app/opengraph-image.tsx) — selalu valid,
  // menggantikan /og-image.jpg yang tidak ada (404) dan merusak gambar di structured data.
  ogImage: `${SITE_URL}/opengraph-image`,
} as const;

/** JSON-LD AutoRental (LocalBusiness) — dipasang sekali di layout untuk local SEO */
export const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  "@id": `${SITE_URL}/#business`,
  name: SITE.name,
  description: SITE.description,
  url: SITE_URL,
  telephone: SITE.telephone,
  priceRange: "Rp 300.000 - Rp 4.000.000",
  currenciesAccepted: "IDR",
  image: SITE.ogImage,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    addressCountry: SITE.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  areaServed: SITE.areaServed.map((name) => ({ "@type": "City", name })),
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "21:00",
  },
  sameAs: [`https://wa.me/${SITE.whatsapp}`],
};
