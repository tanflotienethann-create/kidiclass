import AdminShell from "../AdminShell";
import AdminTaxonomyManager from "./AdminTaxonomyManager";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="Réglages boutique"
      subtitle="Ajoutez ou retirez les options utilisées dans les produits, les filtres et les pages de la boutique."
    >
      <AdminTaxonomyManager />
    </AdminShell>
  );
}
