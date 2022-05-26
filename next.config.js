/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  experimental: {
    images: {
      layoutRaw: true,
    },
  },
};

module.exports = nextConfig;
