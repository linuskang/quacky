import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.linus.my",
                pathname: "/qky/**",
            },
            {
                protocol: "https",
                hostname: "avatars.linus.my",
                pathname: "/10.x/micah/**",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                pathname: "/u/**",
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
        "qky.linus.my",
    ],
}

export default nextConfig
