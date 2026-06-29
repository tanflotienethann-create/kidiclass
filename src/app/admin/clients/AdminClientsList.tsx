"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import { DATA_RESET_AT } from "@/lib/dataReset";
import { supabase } from "@/lib/supabase";

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
};

type ClientOrder = {
  user_id: string | null;
  customer_city: string | null;
  status: string | null;
  total_amount: number | null;
  loyalty_points_earned: number | null;
  created_at: string;
};

type ClientSummary = ClientProfile & {
  availablePoints: number;
  pendingPoints: number;
  ordersCount: number;
  totalSpent: number;
  latestCity: string;
};

function getOrderPoints(order: ClientOrder) {
  return Number(
    order.loyalty_points_earned ??
      Math.floor(Number(order.total_amount || 0) / 1000),
  );
}

export default function AdminClientsList() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const [profilesResult, ordersResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,full_name,email,phone,role")
        .eq("role", "client")
        .order("full_name", { ascending: true }),
      supabase
        .from("orders")
        .select(
          "user_id,customer_city,status,total_amount,loyalty_points_earned,created_at",
        )
        .not("user_id", "is", null)
        .gte("created_at", DATA_RESET_AT)
        .order("created_at", { ascending: false }),
    ]);

    if (profilesResult.error) {
      setMessage(
        "Impossible de charger les comptes clients avec les autorisations actuelles.",
      );
      setLoading(false);
      return;
    }

    const profiles = (profilesResult.data as ClientProfile[]) || [];
    const orders = ordersResult.error
      ? []
      : ((ordersResult.data as ClientOrder[]) || []);

    const summaries = profiles.map((profile) => {
      const clientOrders = orders.filter(
        (order) => order.user_id === profile.id,
      );
      const deliveredOrders = clientOrders.filter(
        (order) => order.status === "Livrée",
      );
      const pendingOrders = clientOrders.filter(
        (order) => order.status !== "Livrée" && order.status !== "Annulée",
      );

      return {
        ...profile,
        availablePoints: deliveredOrders.reduce(
          (sum, order) => sum + getOrderPoints(order),
          0,
        ),
        pendingPoints: pendingOrders.reduce(
          (sum, order) => sum + getOrderPoints(order),
          0,
        ),
        ordersCount: clientOrders.length,
        totalSpent: deliveredOrders.reduce(
          (sum, order) => sum + Number(order.total_amount || 0),
          0,
        ),
        latestCity:
          clientOrders.find((order) => order.customer_city)?.customer_city ||
          "Non renseignée",
      };
    });

    setClients(summaries);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadClients();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    if (!query) return clients;

    return clients.filter((client) =>
      [client.full_name, client.email, client.phone, client.latestCity].some(
        (value) => value?.toLocaleLowerCase("fr").includes(query),
      ),
    );
  }, [clients, search]);

  if (loading) {
    return (
      <p className="py-10 text-center font-black text-[#1db7bd]">
        Chargement des clients...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-gray-500">Comptes clients</p>
          <p className="mt-1 text-3xl font-black text-gray-950">
            {clients.length}
          </p>
        </div>

        <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-gray-200 px-4 focus-within:border-[#1db7bd]">
          <Search size={20} className="text-[#1db7bd]" strokeWidth={2.5} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un client"
            className="min-w-0 flex-1 bg-transparent py-4 font-bold text-gray-950 outline-none"
          />
        </label>
      </div>

      {message && (
        <p className="rounded-2xl bg-red-50 p-4 font-black text-red-600">
          {message}
        </p>
      )}

      {!message && filteredClients.length === 0 ? (
        <div className="border border-dashed border-gray-200 p-8 text-center">
          <UserRound
            size={38}
            className="mx-auto text-[#1db7bd]"
            strokeWidth={2.5}
          />
          <p className="mt-4 font-black text-gray-950">
            Aucun client ne correspond à cette recherche
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredClients.map((client) => (
            <article
              key={client.id}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9fbfc] text-[#1db7bd]">
                  <UserRound size={24} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-black text-gray-950">
                    {client.full_name || "Nom non renseigné"}
                  </h3>
                  <p className="mt-2 flex items-start gap-2 break-all text-sm font-bold text-gray-600">
                    <Mail size={16} className="mt-0.5 shrink-0 text-[#1db7bd]" />
                    {client.email || "Email non renseigné"}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-600">
                    <Phone size={16} className="shrink-0 text-[#f36f45]" />
                    {client.phone || "Téléphone non renseigné"}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-600">
                    <MapPin size={16} className="shrink-0 text-[#c7a900]" />
                    {client.latestCity}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-4">
                <div className="rounded-lg bg-[#e9fbfc] p-3">
                  <p className="flex items-center gap-1 text-xs font-black text-[#1db7bd]">
                    <BadgeCheck size={15} /> Points
                  </p>
                  <p className="mt-1 text-xl font-black text-[#1db7bd]">
                    {client.availablePoints}
                  </p>
                </div>
                <div className="rounded-lg bg-[#fff9cf] p-3">
                  <p className="flex items-center gap-1 text-xs font-black text-[#9a7e00]">
                    <Sparkles size={15} /> En attente
                  </p>
                  <p className="mt-1 text-xl font-black text-[#9a7e00]">
                    {client.pendingPoints}
                  </p>
                </div>
                <div className="rounded-lg bg-[#fff1f5] p-3">
                  <p className="flex items-center gap-1 text-xs font-black text-[#f36f45]">
                    <ShoppingBag size={15} /> Commandes
                  </p>
                  <p className="mt-1 text-xl font-black text-[#f36f45]">
                    {client.ordersCount}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-black text-gray-500">Achats livrés</p>
                  <p className="mt-1 text-sm font-black text-gray-950">
                    {client.totalSpent.toLocaleString("fr-FR")} F
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
