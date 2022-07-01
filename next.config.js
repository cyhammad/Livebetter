/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
};

module.exports = nextConfig;
