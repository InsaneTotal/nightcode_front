/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
<<<<<<< HEAD
=======
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
>>>>>>> ffb70908e4b8e09d4013cb8033cd7cb1b4ef7279
  },
};

<<<<<<< HEAD
export default nextConfig;  
=======
export default nextConfig;
>>>>>>> ffb70908e4b8e09d4013cb8033cd7cb1b4ef7279
