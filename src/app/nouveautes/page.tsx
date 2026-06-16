import { Suspense } from "react";
import CatalogueClient from "../catalogue/CatalogueClient";

export default function NouveautesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff3bf]" />}>
      <CatalogueClient
        initialHighlight="Nouveautés"
        theme={{
          eyebrow: "Nouveautés",
          title: "Les derniers arrivages pour les kids.",
          description:
            "Une sélection fraîche avec les nouveaux produits ajoutés à la boutique.",
          variant: "new",
        }}
      />
    </Suspense>
  );
}
