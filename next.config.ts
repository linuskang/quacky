import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                pathname: "/9.x/glass/**",
            },
            {
                protocol: "https",
                hostname: "api.dicebear.com",
                pathname: "/10.x/disco/**",
            },
            {
                protocol: "https",
                hostname: "github.com",
                pathname: "/**",
            }
        ],
    },
    async rewrites() {
        return [
            {
                source: "/@:handle",
                destination: "/user/:handle",
            },
        ];
    },
    allowedDevOrigins: [
        "localhost.linus.my",
        "qky.linus.my",
    ],
}

export default nextConfig
