import { Users } from "lucide-react";
import AdminShell from "../AdminShell";
import AdminClientsList from "./AdminClientsList";

export default function AdminClientsPage() {
  return (
    <AdminShell
      title="Clients"
      subtitle="Consultez les comptes clients et leurs points de fidélité."
    >
      <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
            <Users size={30} strokeWidth={2.5} />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
              Comptes clients
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-950">
              Informations et fidélité
            </h2>
          </div>
        </div>

        <AdminClientsList />
      </section>
    </AdminShell>
  );
}
