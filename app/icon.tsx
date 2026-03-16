import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2b1b0e",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "7px",
        }}
      >
        <div
          style={{
            color: "#f5e6d0",
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "Georgia, serif",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size }
  );
}
