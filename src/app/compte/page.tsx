"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DATA_RESET_AT } from "@/lib/dataReset";
import { supabase } from "@/lib/supabase";
import {
  BadgeCheck,
  Gift,
  LogOut,
  PackageCheck,
  Phone,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

type Profile = {
  full_name: string | null;
  phone: string | null;
  role: string | null;
};

type Order = {
  id: number;
  order_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  delivery_area: string;
  payment_method: string;
  total_amount: number;
  loyalty_points_earned: number | null;
  status: string;
  created_at: string;
};

const statusSteps = [
  "En attente",
  "Confirmée",
  "En préparation",
  "Arrivée à Abidjan",
  "En livraison",
  "Livrée",
];

function getPointsFromAmount(amount: number) {
  return Math.floor(Number(amount || 0) / 1000);
}

export default function ComptePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);

      const user = await getSessionUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [profileResult, ordersResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,phone,role")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", DATA_RESET_AT)
          .order("created_at", { ascending: false }),
      ]);

      setProfile((profileResult.data as Profile) || null);

      if (ordersResult.error) {
        setMessage("Impossible de charger vos commandes.");
      } else {
        setOrders((ordersResult.data as Order[]) || []);
      }

      setLoading(false);
    }

    loadAccount();
  }, [router]);

  const loyaltyStats = useMemo(() => {
    const deliveredOrders = orders.filter((order) => order.status === "Livrée");

    const activeOrders = orders.filter(
      (order) => order.status !== "Livrée" && order.status !== "Annulée"
    );

    const availablePoints = deliveredOrders.reduce((sum, order) => {
      return sum + getPointsFromAmount(Number(order.total_amount || 0));
    }, 0);

    const pendingPoints = activeOrders.reduce((sum, order) => {
      return sum + getPointsFromAmount(Number(order.total_amount || 0));
    }, 0);

    return {
      availablePoints,
      pendingPoints,
      deliveredOrdersCount: deliveredOrders.length,
      activeOrdersCount: activeOrders.length,
    };
  }, [orders]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-6">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="font-black text-[#1db7bd]">
            Chargement de votre compte...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="border-b border-gray-100 bg-[#e9fbfc] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="font-black text-[#1db7bd] hover:text-[#f36f45]"
          >
            ← Retour à la boutique
          </Link>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
            Espace client
          </p>

          <h1 className="mt-2 text-5xl font-black text-gray-950">
            Mon compte
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Retrouvez vos informations, vos commandes et vos points fidélité
            KidiClass.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.85fr_1.6fr]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9fbfc] text-[#1db7bd]">
              <UserRound size={34} strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Informations client
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[#fffdf7] p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-black text-gray-500">
                  <UserRound size={17} />
                  Nom
                </p>
                <p className="font-black text-gray-950">
                  {profile?.full_name || "Non renseigné"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#fffdf7] p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-black text-gray-500">
                  <Phone size={17} />
                  Téléphone
                </p>
                <p className="font-black text-gray-950">
                  {profile?.phone || "Non renseigné"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f36f45] px-6 py-4 font-black text-white hover:bg-[#e85e33]"
            >
              <LogOut size={20} strokeWidth={2.5} />
              Se déconnecter
            </button>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff9cf] text-[#c7a900]">
              <Gift size={34} strokeWidth={2.5} />
            </div>

            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f36f45]">
              Fidélité
            </p>

            <h2 className="mt-2 text-2xl font-black text-gray-950">
              Mes points KidiClass
            </h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-[#e9fbfc] p-5">
                <p className="flex items-center gap-2 text-sm font-black text-[#1db7bd]">
                  <BadgeCheck size={18} strokeWidth={2.5} />
                  Points disponibles
                </p>

                <p className="mt-2 text-4xl font-black text-[#1db7bd]">
                  {loyaltyStats.availablePoints}
                </p>

                <p className="mt-2 text-sm font-bold text-gray-600">
                  Calculés sur les commandes livrées.
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff9cf] p-5">
                <p className="flex items-center gap-2 text-sm font-black text-[#c7a900]">
                  <Sparkles size={18} strokeWidth={2.5} />
                  Points en attente
                </p>

                <p className="mt-2 text-4xl font-black text-[#c7a900]">
                  {loyaltyStats.pendingPoints}
                </p>

                <p className="mt-2 text-sm font-bold text-gray-600">
                  Ils seront confirmés quand la commande sera livrée.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#fffdf7] p-4 text-sm font-bold leading-6 text-gray-600">
              Règle actuelle : 1 000 FCFA dépensés = 1 point fidélité.
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1db7bd]">
                Commandes
              </p>

              <h2 className="mt-2 text-3xl font-black text-gray-950">
                Mes commandes
              </h2>
            </div>

            <Link
              href="/catalogue"
              className="rounded-full bg-[#1db7bd] px-6 py-3 text-center font-black text-white hover:bg-[#159ca1]"
            >
              Continuer mes achats
            </Link>
          </div>

          {message && (
            <p className="mb-5 rounded-2xl bg-red-50 p-4 font-bold text-red-500">
              {message}
            </p>
          )}

          {orders.length === 0 ? (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#f36f45]">
                <ShoppingBag size={34} strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-gray-950">
                Aucune commande pour le moment
              </h3>

              <p className="mt-3 text-gray-600">
                Vos futures commandes apparaîtront ici.
              </p>

              <Link
                href="/catalogue"
                className="mt-6 inline-block rounded-full bg-[#f36f45] px-7 py-3 font-black text-white hover:bg-[#e85e33]"
              >
                Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const currentIndex = statusSteps.indexOf(order.status);
                const points = getPointsFromAmount(Number(order.total_amount || 0));

                return (
                  <div
                    key={order.id}
                    className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-500">
                          Référence commande
                        </p>

                        <h3 className="mt-1 text-3xl font-black text-[#1db7bd]">
                          {order.order_reference}
                        </h3>

                        <p className="mt-2 text-sm font-bold text-gray-500">
                          {new Date(order.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`w-fit rounded-full px-5 py-3 text-sm font-black ${
                            order.status === "Livrée"
                              ? "bg-green-50 text-green-600"
                              : order.status === "Annulée"
                              ? "bg-red-50 text-red-500"
                              : "bg-[#fff9cf] text-[#c7a900]"
                          }`}
                        >
                          {order.status}
                        </span>

                        {order.status !== "Annulée" && (
                          <span className="w-fit rounded-full bg-[#e9fbfc] px-5 py-3 text-sm font-black text-[#1db7bd]">
                            {points} point(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-black text-gray-950">
                          Détails
                        </h4>

                        <div className="space-y-2 text-sm font-bold text-gray-600">
                          <p>
                            Livraison : {order.delivery_area || "Abidjan"} —{" "}
                            {order.customer_city}
                          </p>

                          <p>Paiement : {order.payment_method}</p>

                          <p className="text-xl font-black text-[#f36f45]">
                            Total :{" "}
                            {Number(order.total_amount).toLocaleString(
                              "fr-FR"
                            )}{" "}
                            FCFA
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-4 flex items-center gap-2 font-black text-gray-950">
                          <PackageCheck
                            size={20}
                            className="text-[#1db7bd]"
                            strokeWidth={2.5}
                          />
                          Avancement
                        </h4>

                        <div className="space-y-3">
                          {statusSteps.map((step, index) => {
                            const isDone = index <= currentIndex;

                            return (
                              <div
                                key={step}
                                className="flex items-center gap-3"
                              >
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-full font-black ${
                                    isDone
                                      ? "bg-[#1db7bd] text-white"
                                      : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {isDone ? "✓" : index + 1}
                                </div>

                                <span
                                  className={`text-sm font-bold ${
                                    isDone ? "text-gray-950" : "text-gray-400"
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-[#e9fbfc] p-4 text-sm font-bold leading-6 text-[#1db7bd]">
                      Les points de fidélité sont confirmés quand la commande
                      passe au statut “Livrée”.
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
