import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/api";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs().catch(() => []);

  const landingPages = [
    "/rental-mobil-manado",
    "/sewa-mobil-lepas-kunci-manado",
    "/rental-mobil-dengan-sopir-manado",
  ];

  const staticPages = ["", "/katalog", "/promo", "/banding", "/tentang", "/blog", ...landingPages].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : landingPages.includes(p) ? 0.9 : 0.8,
  }));

  const carPages = slugs.map((slug) => ({
    url: `${SITE_URL}/mobil/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...carPages, ...blogPages];
}
