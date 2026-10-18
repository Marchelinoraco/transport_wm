import type { Config } from "tailwindcss";

// Tema mengikuti client_wm: stock Tailwind (aksen red-600 di atas netral slate),
// tanpa palet custom — identitas visual dibentuk lewat pilihan kelas.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        subtleZoom: {
          "0%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1.18)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        maskUp: {
          "0%": { transform: "translateY(105%)" },
          "100%": { transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        progress: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Dipakai dengan fill-mode `backwards`, BUKAN `both`: wrapper halaman yang
        // masih ber-transform (matriks identitas sekalipun) menjadi containing block
        // bagi elemen `fixed` di dalamnya (bar booking). Setelah selesai, gaya lepas.
        pageIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out forwards",
        "subtle-zoom": "subtleZoom 12s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "mask-up": "maskUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 45s linear infinite",
        progress: "progress 6s linear forwards",
        "gradient-shift": "gradientShift 12s ease-in-out infinite",
        "page-in": "pageIn 0.35s ease-out backwards",
        pop: "pop 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
