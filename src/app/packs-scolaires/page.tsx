import { Suspense } from "react";
import CatalogueClient from "../catalogue/CatalogueClient";

export default function PacksScolairesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#e9fbfc]" />}>
      <CatalogueClient
        initialCategory="Packs scolaires"
        theme={{
          eyebrow: "Packs scolaires",
          title: "Tout pour une rentrée bien équipée",
          description:
            "Sacs, trousses, gourdes, boîtes à goûter et packs pratiques pour préparer l’école avec style.",
          variant: "school",
        }}
      />
    </Suspense>
  );
}
