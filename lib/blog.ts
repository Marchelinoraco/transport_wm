// Blog Welcome Manado Transport — sumber konten artikel (file-based, tanpa database).
// Tambah artikel baru: buat file di lib/posts/<slug>.ts lalu daftarkan di array `posts` di bawah.

import { post as bandaraPost } from "./posts/sewa-mobil-bandara-sam-ratulangi";
import { post as hargaPost } from "./posts/harga-sewa-mobil-manado-2026";

/** Blok konten artikel — dirender oleh components/BlogContent.tsx.
 *  Teks mendukung inline **tebal** dan tautan [label](/path). */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "callout"; text: string }
  | { type: "cta"; text: string; wa: string };

export type BlogPost = {
  slug: string;
  /** Judul utama (H1). Title tag = `${title}` + template "| Welcome Manado Transport". */
  title: string;
  /** Override <title> bila ingin beda dari H1 (opsional). */
  metaTitle?: string;
  /** Meta description (≤160 karakter). */
  description: string;
  /** Ringkasan singkat untuk kartu di halaman daftar. */
  excerpt: string;
  keywords: string[];
  /** Tanggal terbit ISO (YYYY-MM-DD). */
  date: string;
  /** Tanggal update ISO (opsional). */
  updated?: string;
  /** Path gambar sampul (di /public) atau URL absolut. */
  cover: string;
  coverAlt: string;
  category: string;
  readingMinutes: number;
  body: Block[];
};

const posts: BlogPost[] = [bandaraPost, hargaPost];

/** Semua artikel, terbaru di atas. */
export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}

/** Artikel lain (untuk bagian "Baca juga"), maksimal `limit`. */
export function getRelatedPosts(slug: string, limit = 2): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, limit);
}
