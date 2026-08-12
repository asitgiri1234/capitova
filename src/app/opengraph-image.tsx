import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#06080B",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#7BFFC4",
          }}
        >
          <div style={{ width: 48, height: 1, backgroundColor: "#7BFFC4" }} />
          Precision Biology
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 148,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "#EDEAE4",
              lineHeight: 1,
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              color: "rgba(237, 234, 228, 0.6)",
              letterSpacing: "-0.01em",
            }}
          >
            {SITE.tagline}
          </div>
        </div>

        <div style={{ display: "flex", height: 2, width: "100%" }}>
          <div style={{ width: "22%", backgroundColor: "#7BFFC4" }} />
          <div
            style={{ flex: 1, backgroundColor: "rgba(237, 234, 228, 0.12)" }}
          />
        </div>
      </div>
    ),
    size,
  );
}
