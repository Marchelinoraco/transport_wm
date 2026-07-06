import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-32 text-center">
      <h1 className="text-6xl font-bold text-slate-900 dark:text-white">404</h1>
      <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">Halaman tidak ditemukan</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
      >
        Kembali ke Beranda
      </Link>
    </section>
  );
}
