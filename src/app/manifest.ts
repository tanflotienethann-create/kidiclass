import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KidiClass",
    short_name: "KidiClass",
    description: "Les enfants sapés comme jamais.",
    start_url: SITE_URL,
    scope: SITE_URL,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#087f83",
    icons: [
      {
        src: "/favicon.png?v=8",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-192.png?v=8",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png?v=8",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png?v=8",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
