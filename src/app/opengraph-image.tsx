import { ImageResponse } from "next/og";

export const alt = "Devbhoomi Prep – Uttarakhand Competitive Exam Preparation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(135deg, #0b2559 0%, #163e86 60%, #1e4fa3 100%)", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 40 40">
            <rect width="40" height="40" rx="10" fill="#0b2559" />
            <path d="M6 27 L15 14 L20 21 L25 12 L34 27 Z" fill="#4c7bce" />
            <path d="M6 27 L15 14 L20 21 L14.5 27 Z" fill="#7fa3e0" />
            <path d="M25 12 L34 27 L27.5 27 L22 19.5 Z" fill="#7fa3e0" />
            <path d="M11 31.5 C14.5 29.5 17.5 29.5 20 31.5 C22.5 29.5 25.5 29.5 29 31.5 L29 34 C25.5 32 22.5 32 20 34 C17.5 32 14.5 32 11 34 Z" fill="#f9b125" />
            <circle cx="29" cy="10" r="2.2" fill="#f9b125" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 700 }}>Devbhoomi Prep</span>
            <span style={{ fontSize: 18, color: "#b3c8ee", letterSpacing: 2 }}>UTTARAKHAND EXAMS</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>Prepare Smarter. Crack Uttarakhand Government Exams.</span>
          <span style={{ fontSize: 26, color: "#d9e4f7" }}>Books · Notes · Previous Year Papers · Mock Tests · Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["UKPSC", "UKSSSC", "Police", "Patwari", "VDO", "Forest Guard", "UTET"].map((t) => (
            <span key={t} style={{ padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontSize: 20 }}>{t}</span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
