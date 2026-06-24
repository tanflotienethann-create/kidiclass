import { BadgePercent } from "lucide-react";
import AdminShell from "../AdminShell";
import AdminPromotionsManager from "./AdminPromotionsManager";

export default function AdminPromotionsPage() {
  return (
    <AdminShell
      title="Codes promo"
      subtitle="Créez les remises proposées aux clients et choisissez leur pourcentage."
    >
      <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
            <BadgePercent size={30} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
              Promotions
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-950">
              Gérer les codes promo
            </h2>
          </div>
        </div>

        <AdminPromotionsManager />
      </section>
    </AdminShell>
  );
}
