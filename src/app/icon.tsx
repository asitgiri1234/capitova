import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06080B",
          color: "#7BFFC4",
          fontSize: 42,
          fontWeight: 600,
          letterSpacing: "-0.05em",
        }}
      >
        C
      </div>
    ),
    size,
  );
}
