import AdminShell from "../AdminShell";
import AdminOrderHistoryList from "./AdminOrderHistoryList";

export default function AdminHistoriquePage() {
  return (
    <AdminShell
      title="Historique des commandes"
      subtitle="Retrouvez ici toutes les commandes déjà livrées."
    >
      <AdminOrderHistoryList />
    </AdminShell>
  );
}