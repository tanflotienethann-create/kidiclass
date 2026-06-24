"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  Truck,
} from "lucide-react";
import { useState } from "react";

type Order = {
  id: number;
  order_reference: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_city: string | null;
  customer_address: string | null;
  payment_method: string | null;
  status: string | null;
  total_amount: number | null;
  delivery_area: string | null;
  delivery_fee: number | null;
  created_at: string;
};

const countryCodes = [
  { country: "Côte d’Ivoire", code: "+225" },
  { country: "France", code: "+33" },
  { country: "Belgique", code: "+32" },
  { country: "Suisse", code: "+41" },
  { country: "Canada", code: "+1" },
  { country: "États-Unis", code: "+1" },
  { country: "Royaume-Uni", code: "+44" },
  { country: "Sénégal", code: "+221" },
  { country: "Burkina Faso", code: "+226" },
  { country: "Mali", code: "+223" },
  { country: "Togo", code: "+228" },
  { country: "Bénin", code: "+229" },
  { country: "Guinée", code: "+224" },
  { country: "Cameroun", code: "+237" },
  { country: "Gabon", code: "+241" },
  { country: "Congo", code: "+242" },
  { country: "RDC", code: "+243" },
];

const countryCodeOptions = countryCodes.map((item) => {
  return `${item.country} ${item.code}`;
});

const statusSteps = [
  "En attente",
  "Confirmée",
  "En préparation",
  "Arrivée à Abidjan",
  "En livraison",
  "Livrée",
];

export default function SuiviPage() {
  const [countryCodeLabel, setCountryCodeLabel] = useState(
    "Côte d’Ivoire +225"
  );
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCountryCode =
    countryCodes.find((item) => {
      return `${item.country} ${item.code}` === countryCodeLabel;
    })?.code || "+225";

  function cleanPhone(value: string) {
    return value.replace(/\D/g, "");
  }

  function getPhoneVariants(value: string) {
    const cleaned = cleanPhone(value);
    const withoutCountryCode = cleaned.startsWith("225")
      ? cleaned.slice(3)
      : cleaned;
    const withoutLeadingZero = withoutCountryCode.replace(/^0+/, "");

    return Array.from(
      new Set([cleaned, withoutCountryCode, withoutLeadingZero].filter(Boolean))
    );
  }

  function phoneMatchesOrder(orderPhone: string | null, searchedPhone: string) {
    const orderVariants = getPhoneVariants(orderPhone || "");
    const searchVariants = getPhoneVariants(searchedPhone);

    return searchVariants.some((searchValue) => {
      return orderVariants.some((orderValue) => {
        return (
          orderValue.includes(searchValue) ||
          searchValue.includes(orderValue)
        );
      });
    });
  }

  function getStepIndex(status: string | null) {
    const index = statusSteps.findIndex((step) => step === status);

    if (index === -1) return 0;

    return index;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setOrders([]);

    if (!phone.trim() && !reference.trim()) {
      setMessage("Veuillez renseigner votre numéro ou votre référence de commande.");
      setLoading(false);
      return;
    }

    const searchedPhone = cleanPhone(`${selectedCountryCode}${phone}`);
    const searchedReference = reference.trim().toUpperCase();

    const { data, error } = await supabase.rpc("track_kidiclass_orders", {
      search_phone: phone.trim() ? searchedPhone : "",
      search_reference: searchedReference,
    });

    let allOrders = (data as Order[]) || [];

    if (error) {
      const fallback = await supabase
        .from("orders")
        .select(
          "id,order_reference,customer_name,customer_phone,customer_city,customer_address,payment_method,status,total_amount,delivery_area,delivery_fee,created_at"
        )
        .order("created_at", { ascending: false });

      if (fallback.error) {
        setMessage(
          "Impossible de charger le suivi. Vérifiez que la fonction Supabase de suivi est installée."
        );
        setLoading(false);
        return;
      }

      allOrders = (fallback.data as Order[]) || [];
    }

    const matchedOrders = allOrders.filter((order) => {
      const matchesPhone =
        !phone.trim() || phoneMatchesOrder(order.customer_phone, searchedPhone);

      const matchesReference =
        !searchedReference ||
        (order.order_reference || "").toUpperCase().includes(searchedReference);

      return matchesPhone && matchesReference;
    });

    if (matchedOrders.length === 0) {
      setMessage("Aucune commande trouvée avec ces informations.");
      setLoading(false);
      return;
    }

    setOrders(matchedOrders);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#faf8f4]">
      <section className="retail-band border-b border-[#ddd6cc] px-6 py-14">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="retail-chip mb-5 inline-flex items-center gap-2 px-5 py-2 text-sm uppercase">
            <Truck size={18} strokeWidth={2.5} />
            Suivi de commande
          </div>

          <h1 className="retail-section-title text-5xl font-black leading-tight md:text-7xl">
            Suivre mon colis
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-gray-600">
            Entrez votre numéro de téléphone ou la référence reçue après achat
            pour retrouver l’avancement de votre commande.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={handleSearch}
          className="retail-card p-7"
        >
          <div className="grid gap-4 md:grid-cols-[220px_1fr_1fr_auto] md:items-end">
            <KidiclassSelect
              label="Indicatif"
              value={countryCodeLabel}
              options={countryCodeOptions}
              onChange={setCountryCodeLabel}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-black text-gray-700">
                Numéro de téléphone
              </span>

              <input
                type="tel"
                placeholder="Ex : 07 79 31 15 55"
                className="w-full rounded-xl border border-[#ddd6cc] bg-white p-4 font-bold text-black outline-none placeholder:text-gray-400 focus:border-[#0a9ba2] focus:ring-4 focus:ring-[#0a9ba2]/10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-gray-700">
                Référence
              </span>

              <input
                type="text"
                placeholder="Ex : KDC-2026-1234"
                className="w-full rounded-xl border border-[#ddd6cc] bg-white p-4 font-bold uppercase text-black outline-none placeholder:text-gray-400 focus:border-[#0a9ba2] focus:ring-4 focus:ring-[#0a9ba2]/10"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[58px] items-center justify-center gap-2 rounded-xl bg-[#d9472d] px-7 font-black text-white shadow-sm hover:bg-[#087f83] disabled:opacity-50"
            >
              <Search size={20} strokeWidth={2.5} />
              {loading ? "Recherche..." : "Suivre"}
            </button>
          </div>

          {message && (
            <p className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-500">
              {message}
            </p>
          )}
        </form>

        {orders.length > 0 && (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const currentStepIndex = getStepIndex(order.status);
              const isCancelled = order.status === "Annulée";

              return (
                <article
                  key={order.id}
                  className="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div>
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-black ${
                          isCancelled
                            ? "bg-red-50 text-red-500"
                            : "bg-[#e9fbfc] text-[#1db7bd]"
                        }`}
                      >
                        {order.status || "En attente"}
                      </span>

                      <h2 className="mt-4 text-3xl font-black text-gray-950">
                        {order.order_reference || "Commande KidiClass"}
                      </h2>

                      <p className="mt-2 text-sm font-bold text-gray-500">
                        Commande passée le {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff9cf] p-4 text-right">
                      <p className="text-sm font-bold text-[#c7a900]">Total</p>

                      <p className="text-2xl font-black text-[#f36f45]">
                        {Number(order.total_amount || 0).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[#fffdf7] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[#1db7bd]">
                        <Phone size={18} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Téléphone
                        </span>
                      </div>

                      <p className="font-black text-gray-950">
                        {order.customer_phone}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fffdf7] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[#f36f45]">
                        <MapPin size={18} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Livraison
                        </span>
                      </div>

                      <p className="font-black text-gray-950">
                        {order.customer_city || "Non renseigné"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fffdf7] p-4">
                      <div className="mb-2 flex items-center gap-2 text-[#c7a900]">
                        <PackageCheck size={18} strokeWidth={2.5} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          Paiement
                        </span>
                      </div>

                      <p className="font-black text-gray-950">
                        {order.payment_method || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-5 text-2xl font-black text-gray-950">
                      Avancement de la commande
                    </h3>

                    {isCancelled ? (
                      <div className="rounded-2xl bg-red-50 p-5 font-bold text-red-500">
                        Cette commande a été annulée.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {statusSteps.map((step, index) => {
                          const isDone = index <= currentStepIndex;

                          return (
                            <div key={step} className="flex items-center gap-4">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                  isDone
                                    ? "bg-[#1db7bd] text-white"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 size={22} strokeWidth={2.5} />
                                ) : (
                                  <Clock3 size={22} strokeWidth={2.5} />
                                )}
                              </div>

                              <div>
                                <p
                                  className={`font-black ${
                                    isDone
                                      ? "text-gray-950"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {step}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
