import { Suspense } from "react";
import CatalogueClient from "./CatalogueClient";

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fffdf7] px-5 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#1db7bd]">
                Catalogue
              </p>

              <h1 className="mt-3 text-4xl font-black text-gray-950">
                Chargement des produits...
              </h1>

              <p className="mt-3 font-bold text-gray-500">
                Merci de patienter quelques secondes.
              </p>
            </div>
          </div>
        </main>
      }
    >
      <CatalogueClient />
    </Suspense>
  );
}