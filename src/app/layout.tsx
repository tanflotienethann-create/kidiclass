import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "KidiClass",
  description: "Boutique en ligne pour enfants",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KidiClass",
    description: "Les enfants sapés comme jamais.",
    url: SITE_URL,
    siteName: "KidiClass",
    locale: "fr_CI",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico?v=8", sizes: "any" },
      { url: "/favicon.png?v=8", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png?v=8", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png?v=8", type: "image/png", sizes: "512x512" },
      { url: "/icon.png?v=8", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=8",
    apple: "/apple-icon.png?v=8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
