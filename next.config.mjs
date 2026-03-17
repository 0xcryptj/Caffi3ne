/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // postprocessing ships ESM — Next.js needs to transpile it
  transpilePackages: ["postprocessing", "@react-three/postprocessing"],
};

export default nextConfig;
