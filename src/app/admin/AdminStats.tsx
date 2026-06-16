"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

type Stats = {
  productsCount: number;
  ordersCount: number;
  pendingOrdersCount: number;
  deliveredOrdersCount: number;
  revenue: number;
};

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
    deliveredOrdersCount: 0,
    revenue: 0,
  });

  const fetchStats = useCallback(async () => {
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { data: orders } = await supabase
      .from("orders")
      .select("status,total_amount");

    const ordersList = orders || [];

    const ordersCount = ordersList.length;

    const pendingOrdersCount = ordersList.filter(
      (order) => order.status === "En attente"
    ).length;

    const deliveredOrdersCount = ordersList.filter(
      (order) => order.status === "Livrée"
    ).length;

    const revenue = ordersList
      .filter((order) => order.status !== "Annulée")
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    setStats({
      productsCount: productsCount || 0,
      ordersCount,
      pendingOrdersCount,
      deliveredOrdersCount,
      revenue,
    });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchStats();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchStats]);

  const cards = [
    {
      label: "Produits",
      value: stats.productsCount,
      icon: ShoppingBag,
      bg: "bg-[#e9fbfc]",
      color: "text-[#1db7bd]",
    },
    {
      label: "Commandes",
      value: stats.ordersCount,
      icon: PackageCheck,
      bg: "bg-[#fff1f5]",
      color: "text-[#f36f45]",
    },
    {
      label: "En attente",
      value: stats.pendingOrdersCount,
      icon: Clock3,
      bg: "bg-[#fff9cf]",
      color: "text-[#c7a900]",
    },
    {
      label: "Livrées",
      value: stats.deliveredOrdersCount,
      icon: CheckCircle2,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Chiffre d’affaires",
      value: `${stats.revenue.toLocaleString("fr-FR")} FCFA`,
      icon: Banknote,
      bg: "bg-gray-100",
      color: "text-gray-950",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
            >
              <Icon size={26} strokeWidth={2.5} />
            </div>

            <p className="text-sm font-black uppercase tracking-wide text-gray-400">
              {card.label}
            </p>

            <p className={`mt-2 text-2xl font-black ${card.color}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
