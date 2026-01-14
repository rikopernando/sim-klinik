import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sbvxydmgfqjuhxqdmbeu.supabase.co",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
}

export default nextConfig
