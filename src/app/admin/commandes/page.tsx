import AdminShell from "../AdminShell";
import AdminOrdersList from "../AdminOrdersList";
import { PackageCheck } from "lucide-react";

export default function AdminCommandesPage() {
  return (
    <AdminShell
      title="Commandes"
      subtitle="Suivez les commandes reçues et mettez à jour leur statut."
    >
      <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
            <PackageCheck size={30} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
              Gestion commandes
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-950">
              Commandes reçues
            </h2>

            <p className="mt-2 text-sm font-bold text-gray-500">
              Consultez les commandes, contactez les clients et changez les
              statuts.
            </p>
          </div>
        </div>

        <AdminOrdersList />
      </section>
    </AdminShell>
  );
}