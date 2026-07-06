import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { getPostBySlug, getPostSlugs, getRelatedPosts } from "@/lib/blog";
import { SITE, SITE_URL } from "@/lib/site";
import BlogContent from "@/components/BlogContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Artikel tidak ditemukan" };
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [`${SITE_URL}${post.cover}`],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Organization", name: SITE.name, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: SITE.ogImage },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <article className="bg-white dark:bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
          <Link href="/" className="hover:text-red-600">Beranda</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-red-600">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-500 dark:text-slate-400">{post.category}</span>
        </nav>

        {/* Header */}
        <header className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-3 py-1 text-xs font-medium text-red-600">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {post.readingMinutes} menit baca
            </span>
          </div>
        </header>

        {/* Cover */}
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-red-600/5 to-slate-100 dark:from-red-600/10 dark:to-slate-800">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Konten */}
        <div className="mt-10">
          <BlogContent blocks={post.body} />
        </div>

        {/* Kembali */}
        <div className="mt-12 border-t border-slate-100 pt-6 dark:border-slate-800">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke semua artikel
          </Link>
        </div>
      </div>

      {/* Baca juga */}
      {related.length > 0 && (
        <section className="bg-slate-50 py-14 dark:bg-slate-800/50">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Baca juga</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-red-300 hover:shadow-md dark:hover:border-red-800 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-red-600/5 to-slate-100 dark:from-red-600/10 dark:to-slate-700">
                    <Image
                      src={p.cover}
                      alt={p.coverAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-contain p-6"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-red-600">{p.category}</span>
                    <h3 className="mt-1.5 font-bold leading-snug text-slate-900 transition group-hover:text-red-600 dark:text-white">
                      {p.title}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-red-600">
                      Baca <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
