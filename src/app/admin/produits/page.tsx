import AdminShell from "../AdminShell";
import AddProductForm from "../AddProductForm";
import AdminProductsList from "../AdminProductsList";
import { ShoppingBag, Tags } from "lucide-react";

export default function AdminProduitsPage() {
  return (
    <AdminShell
      title="Produits"
      subtitle="Ajoutez, modifiez et organisez les articles KidiClass."
    >
      <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
            <ShoppingBag size={30} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
              Nouveau produit
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-950">
              Ajouter un article
            </h2>

            <p className="mt-2 text-sm font-bold text-gray-500">
              Remplissez les informations du produit puis ajoutez ses images.
            </p>
          </div>
        </div>

        <AddProductForm />
      </section>

      <section className="mt-8 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
            <Tags size={30} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
              Catalogue
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-950">
              Produits existants
            </h2>
          </div>
        </div>

        <AdminProductsList />
      </section>
    </AdminShell>
  );
}