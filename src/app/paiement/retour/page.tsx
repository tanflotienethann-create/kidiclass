import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

type PaymentReturnPageProps = {
  searchParams: Promise<{
    status?: string;
    reference?: string;
  }>;
};

export default async function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const params = await searchParams;
  const status = params.status || "success";
  const reference = params.reference || "";
  const isCancelled = status === "cancelled";

  return (
    <main className="min-h-screen bg-[#fffdf7] px-6 py-12">
      <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <div
          className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
            isCancelled
              ? "bg-red-50 text-red-500"
              : "bg-[#e9fbfc] text-[#1db7bd]"
          }`}
        >
          {isCancelled ? (
            <XCircle size={48} strokeWidth={2.5} />
          ) : (
            <CheckCircle2 size={48} strokeWidth={2.5} />
          )}
        </div>

        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
          Paiement en ligne
        </p>

        <h1 className="text-4xl font-black text-gray-950">
          {isCancelled ? "Paiement interrompu" : "Paiement en vérification"}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-7 text-gray-600">
          {isCancelled
            ? "Votre paiement n'a pas été finalisé. Vous pouvez reprendre votre commande ou contacter KidiClass si besoin."
            : "Merci. Le paiement est confirmé automatiquement à KidiClass. Votre commande sera mise à jour dès que la notification est reçue."}
        </p>

        {reference && (
          <div className="mt-7 rounded-[2rem] bg-[#e9fbfc] p-6">
            <p className="text-sm font-bold text-gray-600">
              Référence commande
            </p>

            <p className="mt-2 text-3xl font-black text-[#1db7bd]">
              {reference}
            </p>
          </div>
        )}

        {!isCancelled && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#fff9cf] p-4 text-sm font-black leading-6 text-[#c7a900]">
            <Clock3 size={20} strokeWidth={2.5} />
            La confirmation peut prendre quelques instants.
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/suivi${reference ? `?reference=${encodeURIComponent(reference)}` : ""}`}
            className="rounded-full bg-[#1db7bd] px-8 py-4 font-black text-white hover:bg-[#159ca1]"
          >
            Suivre ma commande
          </Link>

          <Link
            href="/catalogue"
            className="rounded-full border-2 border-[#f36f45] px-8 py-4 font-black text-[#f36f45] hover:bg-[#f36f45] hover:text-white"
          >
            Retour à la boutique
          </Link>
        </div>
      </section>
    </main>
  );
}
