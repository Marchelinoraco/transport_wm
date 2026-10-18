/** Fade/slide singkat setiap pindah halaman (template dirender ulang per navigasi). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
