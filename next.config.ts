import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  // Prevent Firebase from running on the server during prerender
  serverExternalPackages: ['firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
};

export default nextConfig;
