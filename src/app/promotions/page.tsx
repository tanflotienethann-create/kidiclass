import { Suspense } from "react";
import CatalogueClient from "../catalogue/CatalogueClient";

export default function PromotionsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff0e8]" />}>
      <CatalogueClient
        initialHighlight="Promotions"
        theme={{
          eyebrow: "Promotions KidiClass",
          title: "Les bons plans pour faire plaisir",
          description:
            "Retrouvez tous les articles en promotion et filtrez-les selon vos envies",
          variant: "promotion",
        }}
      />
    </Suspense>
  );
}
