import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";
import { ChatWidgetProvider } from "@/lib/chatWidget";
import { CompareProvider } from "@/components/CompareProvider";
import CompareBar from "@/components/CompareBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { SITE, SITE_URL, businessJsonLd } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rental Mobil & Transportasi Manado | Welcome Manado Transport",
    template: "%s | Welcome Manado Transport",
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  keywords: [
    "rental mobil Manado",
    "sewa mobil Manado",
    "rental mobil Manado murah",
    "sewa mobil lepas kunci Manado",
    "rental mobil dengan sopir Manado",
    "transportasi Manado",
    "sewa mobil per trip Manado",
    "rental mobil Sulawesi Utara",
    "Welcome Manado Transport",
  ],
  openGraph: {
    title: "Rental Mobil & Transportasi Manado | Welcome Manado Transport",
    description:
      "Sewa mobil & transportasi terbaik di Kota Manado. Pesan mudah via WhatsApp.",
    url: SITE_URL,
    siteName: SITE.name,
    type: "website",
    locale: "id_ID",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#0f172a" />
        {/* Anti-flash: terapkan tema sebelum render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark')})()`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased bg-white dark:bg-slate-900 selection:bg-red-100 selection:text-red-700">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <CompareProvider>
              <ChatWidgetProvider>
                <Navbar />
                <main className="pt-[var(--tinggi-navbar)]">{children}</main>
                <Footer />
                <FloatingChat />
                <CompareBar />
              </ChatWidgetProvider>
            </CompareProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
