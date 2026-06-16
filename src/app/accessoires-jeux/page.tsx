import { Suspense } from "react";
import CatalogueClient from "../catalogue/CatalogueClient";

export default function AccessoiresJeuxPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff1f5]" />}>
      <CatalogueClient
        initialCategory="Accessoires & jeux"
        theme={{
          eyebrow: "Accessoires & jeux",
          title: "Des petits plus utiles, fun et colorés.",
          description:
            "Accessoires, jeux et articles malins pour compléter les looks et le quotidien des enfants.",
          variant: "play",
        }}
      />
    </Suspense>
  );
}
