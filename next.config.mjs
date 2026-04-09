import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // postprocessing ships ESM — Next.js needs to transpile it
  transpilePackages: ["postprocessing", "@react-three/postprocessing"],
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
