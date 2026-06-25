import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                pathname: "/9.x/glass/**",
            },
            {
                protocol: "https",
                hostname: "github.com",
                pathname: "/**",
            }
        ],
    },
}

export default nextConfig
