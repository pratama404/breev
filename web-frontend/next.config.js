/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/aqi_monitoring?authSource=admin',
    AIRPHYNET_API_URL: process.env.AIRPHYNET_API_URL || 'http://localhost:8000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001'
  }
}

module.exports = nextConfig