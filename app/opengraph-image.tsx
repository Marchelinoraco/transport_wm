import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Welcome Manado Transport — Rental Mobil Manado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Badge AM */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              background: "linear-gradient(135deg, #2dd4bf, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 900,
              border: "4px solid rgba(255,255,255,0.85)",
            }}
          >
            WM
          </div>
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            Welcome Manado Transport
          </span>
        </div>

        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, display: "flex", flexWrap: "wrap" }}>
          Rental Mobil &amp; Transportasi
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, color: "#5eead4" }}>
          di Manado
        </div>

        <div style={{ fontSize: 30, marginTop: 32, color: "rgba(255,255,255,0.85)" }}>
          Sewa harian · mingguan · bulanan · per trip · dengan sopir
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <span style={{ background: "#25D366", padding: "8px 20px", borderRadius: 999 }}>
            Pesan via WhatsApp
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>transport.welcomemanado.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
