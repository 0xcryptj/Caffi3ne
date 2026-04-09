import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Only for local `next dev` with Wrangler. During `next build` (e.g. on Vercel) this would spawn
// workerd from @cloudflare/workerd-linux-64, which requires GLIBC_2.35+ and breaks older CI images.
if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // postprocessing ships ESM — Next.js needs to transpile it
  transpilePackages: ["postprocessing", "@react-three/postprocessing"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)"
          }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, must-revalidate"
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
