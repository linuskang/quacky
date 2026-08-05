import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Quacky",
        short_name: "Quacky",
        description: "Simple and open social media, for the classroom.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0920",
        theme_color: "#0b0920",
        icons: [
            {
                src: "/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/maskable-icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            }
        ],
    }
}

// nextjs.org/guides/pwas