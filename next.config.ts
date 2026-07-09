import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        dangerouslyAllowLocalIP: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.linus.my",
                pathname: "/qky/**",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                pathname: "/u/**",
            },
            {
                protocol: "https",
                hostname: "avatars.lkang.au",
                pathname: "/10.x/**",
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
