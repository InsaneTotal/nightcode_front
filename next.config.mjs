/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nightcode-back.onrender.com",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
