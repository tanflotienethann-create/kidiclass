import { Suspense } from "react";
import CatalogueClient from "../catalogue/CatalogueClient";

export default function PlagePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#dff8ff]" />}>
      <CatalogueClient
        initialCategory="Plage"
        theme={{
          eyebrow: "Collection plage",
          title: "Ambiance cocotiers, soleil et tenues de plage.",
          description:
            "Maillots, serviettes et articles d’été pour profiter des sorties plage avec des looks colorés.",
          variant: "beach",
        }}
      />
    </Suspense>
  );
}
