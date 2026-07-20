import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "KidiClass",
    short_name: "KidiClass",
    description: "Les enfants sapés comme jamais.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#087f83",
    categories: ["shopping", "kids", "fashion"],
    icons: [
      {
        src: "/icon-48.png?v=8",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-96.png?v=8",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-144.png?v=8",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png?v=8",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png?v=8",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.png?v=8",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png?v=8",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Promotions",
        short_name: "Promos",
        description: "Voir les offres KidiClass",
        url: "/promotions",
        icons: [{ src: "/icon-192.png?v=8", sizes: "192x192" }],
      },
      {
        name: "Suivi commande",
        short_name: "Suivi",
        description: "Suivre une commande",
        url: "/suivi",
        icons: [{ src: "/icon-192.png?v=8", sizes: "192x192" }],
      },
      {
        name: "Panier",
        short_name: "Panier",
        description: "Ouvrir le panier",
        url: "/panier",
        icons: [{ src: "/icon-192.png?v=8", sizes: "192x192" }],
      },
    ],
  };
}
