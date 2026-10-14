import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarBySlug, getAllSlugs } from "@/lib/api";
import { SITE_URL, SITE } from "@/lib/site";
import CarDetailBody from "@/components/CarDetailBody";
import { adaHarga } from "@/lib/paket";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const car = await getCarBySlug(params.slug).catch(() => null);
  if (!car) return { title: "Mobil tidak ditemukan" };
  const yearLabel = car.year ? ` ${car.year}` : "";
  return {
    title: `${car.name}${yearLabel} — Sewa Mobil Manado`,
    description: `${car.name}${yearLabel}${car.type ? `, ${car.type}` : ""}${car.transmission ? `, ${car.transmission}` : ""}${car.fuel ? `, ${car.fuel}` : ""}. ${car.description ?? ""}`.slice(0, 160),
    alternates: { canonical: `/mobil/${car.slug}` },
    openGraph: {
      title: `${car.name}${yearLabel} | ${SITE.name}`,
      description: car.description ?? "",
      type: "website",
      images: car.images.length ? [{ url: car.images[0] }] : [],
    },
  };
}

export default async function CarDetail({ params }: { params: { slug: string } }) {
  const car = await getCarBySlug(params.slug).catch(() => null);
  if (!car) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.year ? `${car.name} ${car.year}` : car.name,
    model: car.name,
    url: `${SITE_URL}/mobil/${car.slug}`,
    ...(car.year ? { vehicleModelDate: String(car.year) } : {}),
    ...(car.fuel ? { fuelType: car.fuel } : {}),
    ...(car.transmission ? { vehicleTransmission: car.transmission } : {}),
    ...(car.seats ? { seatingCapacity: car.seats } : {}),
    vehicleConfiguration: car.type,
    image: car.images,
    description: car.description,
    ...(adaHarga(car.price_rent)
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price: car.price_rent,
            url: `${SITE_URL}/mobil/${car.slug}`,
            availability:
              car.status === "tersedia"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@type": "AutoRental", name: SITE.name, "@id": `${SITE_URL}/#business` },
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Katalog", item: `${SITE_URL}/katalog` },
      { "@type": "ListItem", position: 3, name: car.name, item: `${SITE_URL}/mobil/${car.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd]) }}
      />
      <CarDetailBody car={car} />
    </>
  );
}
