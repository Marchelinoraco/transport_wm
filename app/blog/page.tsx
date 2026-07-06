import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Artikel & Tips Sewa Mobil Manado",
  description:
    "Tips, panduan, dan info tarif seputar rental & sewa mobil di Manado, Sulawesi Utara. Dari sewa mobil bandara, harga sewa, sampai rekomendasi wisata.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Artikel & Tips Sewa Mobil Manado | Welcome Manado Transport",
    description:
      "Tips & panduan seputar rental dan sewa mobil di Manado, Sulawesi Utara.",
    url: "/blog",
    type: "website",
  },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function BlogIndex() {
  const posts = getAllPosts();

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Welcome Manado Transport",
    url: `${SITE_URL}/blog`,
    description:
      "Tips, panduan, dan info tarif seputar rental & sewa mobil di Manado, Sulawesi Utara.",
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.date,
      dateModified: p.updated ?? p.date,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />

      {/* HERO */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-red-600/5 to-white dark:border-slate-800 dark:from-red-600/10 dark:to-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-1.5 text-sm font-medium text-red-600">
              Artikel & Tips
            </span>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
              Tips & Panduan Sewa Mobil di Manado
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
              Panduan praktis seputar rental & sewa mobil di Manado dan Sulawesi
              Utara — dari tarif, sewa bandara, hingga rekomendasi perjalanan.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* DAFTAR ARTIKEL */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4">
          {posts.length === 0 ? (
            <p className="text-center text-slate-400">Artikel segera hadir.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {posts.map((post, i) => (
                <ScrollReveal key={post.slug} delay={i * 60}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-red-300 hover:shadow-md dark:hover:border-red-800 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-red-600/5 to-slate-100 dark:from-red-600/10 dark:to-slate-700">
                      <Image
                        src={post.cover}
                        alt={post.coverAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-contain p-6 transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-red-600 shadow-sm dark:bg-slate-900/90">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="text-lg font-bold leading-snug text-slate-900 transition group-hover:text-red-600 dark:text-white">
                        {post.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {post.readingMinutes} menit baca
                        </span>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-600">
                        Baca selengkapnya
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
