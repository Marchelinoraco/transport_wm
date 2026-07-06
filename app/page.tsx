import { getCars } from "@/lib/api";
import { dictionaries } from "@/lib/i18n/dictionaries";
import HomeContent from "@/components/HomeContent";

export const revalidate = 60;

export default async function Home() {
  const allCars = await getCars().catch(() => []);

  // FAQ JSON-LD tetap bahasa Indonesia (SEO lokal)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dictionaries.id.faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeContent cars={allCars} />
    </>
  );
}
