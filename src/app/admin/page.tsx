import AdminShell from "./AdminShell";
import AdminStats from "./AdminStats";
import Link from "next/link";
import { PackageCheck, Settings, ShoppingBag, Store } from "lucide-react";

export default function AdminPage() {
  return (
    <AdminShell
      title="Tableau de bord"
      subtitle="Vue d’ensemble de la boutique KidiClass."
    >
      <AdminStats />

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/produits"
          className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
            <ShoppingBag size={30} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-gray-950">
            Gérer les produits
          </h2>

          <p className="mt-3 text-sm font-bold leading-6 text-gray-600">
            Ajouter, modifier ou supprimer les articles de la boutique.
          </p>

          <p className="mt-5 font-black text-[#1db7bd]">Ouvrir →</p>
        </Link>

        <Link
          href="/admin/commandes"
          className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
            <PackageCheck size={30} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-gray-950">
            Suivre les commandes
          </h2>

          <p className="mt-3 text-sm font-bold leading-6 text-gray-600">
            Voir les commandes reçues, modifier leur statut et contacter les
            clients.
          </p>

          <p className="mt-5 font-black text-[#f36f45]">Ouvrir →</p>
        </Link>

        <Link
          href="/"
          className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff9cf] text-[#c7a900]">
            <Store size={30} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-gray-950">
            Voir la boutique
          </h2>

          <p className="mt-3 text-sm font-bold leading-6 text-gray-600">
            Vérifier l’apparence du site côté client.
          </p>

          <p className="mt-5 font-black text-[#c7a900]">Ouvrir →</p>
        </Link>

        <Link
          href="/admin/reglages"
          className="rounded-[2rem] border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2edff] text-[#7c3aed]">
            <Settings size={30} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-gray-950">
            Réglages boutique
          </h2>

          <p className="mt-3 text-sm font-bold leading-6 text-gray-600">
            Gérer les catégories, personnages, niveaux et types de produit.
          </p>

          <p className="mt-5 font-black text-[#7c3aed]">Ouvrir →</p>
        </Link>
      </section>
    </AdminShell>
  );
}
