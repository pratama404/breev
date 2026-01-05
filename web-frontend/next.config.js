const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // env is not needed for strictly standard Next.js env vars, but if you want to expose them explicitly:
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    AIRPHYNET_API_URL: process.env.AIRPHYNET_API_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }
}

module.exports = withPWA(nextConfig)