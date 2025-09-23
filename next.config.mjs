/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // важно за .next/standalone

  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },

  reactStrictMode: true,
};

export default nextConfig;