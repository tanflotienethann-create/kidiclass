"use client";

import KidiclassSelect from "@/components/KidiclassSelect";
import { DATA_RESET_AT } from "@/lib/dataReset";
import { supabase } from "@/lib/supabase";
import {
  Banknote,
  Clock3,
  History,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: number;
  quantity: number;
  selected_size: string | null;
  unit_price: number;
  products: {
    name: string;
    image_url: string | null;
  } | null;
};

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
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_map_address: string | null;
  google_maps_link: string | null;
  delivered_at: string | null;
  created_at: string;
  order_items: OrderItem[];
};

const statusOptions = [
  "En attente",
  "Confirmée",
  "En préparation",
  "Arrivée à Abidjan",
  "En livraison",
  "Expédition à confirmer",
  "Frais de livraison à confirmer",
  "En attente de paiement",
  "Paiement annulé",
  "Paiement échoué",
  "Expédiée",
  "Livrée",
  "Annulée",
];

export default function AdminOrderHistoryList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const deliveredOrders = useMemo(() => {
    return orders
      .filter((order) => order.status === "Livrée")
      .sort((a, b) => {
        const dateA = new Date(a.delivered_at || a.created_at).getTime();
        const dateB = new Date(b.delivered_at || b.created_at).getTime();

        return dateB - dateA;
      });
  }, [orders]);

  async function fetchDeliveredOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          quantity,
          selected_size,
          unit_price,
          products (
            name,
            image_url
          )
        )
      `
      )
      .eq("status", "Livrée")
      .gte("created_at", DATA_RESET_AT)
      .order("delivered_at", { ascending: false, nullsFirst: false });

    if (error) {
      setMessage("Erreur chargement historique : " + error.message);
      setLoading(false);
      return;
    }

    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchDeliveredOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function updateOrderStatus(orderId: number, newStatus: string) {
    setMessage("");

    const deliveredAt =
      newStatus === "Livrée" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        delivered_at: deliveredAt,
      })
      .eq("id", orderId);

    if (error) {
      setMessage("Erreur modification statut : " + error.message);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          status: newStatus,
          delivered_at: deliveredAt,
        };
      })
    );

    setMessage(
      newStatus === "Livrée"
        ? "Statut de la commande mis à jour."
        : "Commande retirée de l’historique."
    );
  }

  function formatDate(date: string | null) {
    if (!date) return "Date non renseignée";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function cleanPhoneNumber(phone: string | null) {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  }

  function getWhatsappLink(order: Order) {
    const cleanedPhone = cleanPhoneNumber(order.customer_phone);
    if (!cleanedPhone) return "";

    const text = encodeURIComponent(
      `Bonjour ${order.customer_name || "cher client"},\n\nNous vous confirmons que votre commande KidiClass ${
        order.order_reference ? `n° ${order.order_reference}` : ""
      } a bien été livrée.\n\nNous espérons que vos articles vous plaisent. Merci pour votre confiance et à très bientôt chez KidiClass.\n\nL’équipe KidiClass`
    );

    return `https://wa.me/${cleanedPhone}?text=${text}`;
  }

  function getGoogleMapsLink(order: Order) {
    if (order.google_maps_link) return order.google_maps_link;

    if (order.delivery_latitude && order.delivery_longitude) {
      return `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`;
    }

    const addressParts = [
      order.customer_address,
      order.delivery_map_address,
      order.customer_city,
      order.delivery_area,
    ].filter(Boolean);

    if (addressParts.length === 0) return "";

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      addressParts.join(", ")
    )}`;
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <Clock3
          size={34}
          className="mx-auto text-[#1db7bd]"
          strokeWidth={2.5}
        />

        <p className="mt-4 font-black text-[#1db7bd]">
          Chargement de l’historique...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {message && (
        <p
          className={`rounded-2xl p-4 font-bold ${
            message.includes("Erreur")
              ? "bg-red-50 text-red-500"
              : "bg-green-50 text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-green-600">
            Historique
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-3xl font-black text-gray-950">
            <History size={30} strokeWidth={2.5} />
            Commandes livrées
          </h2>
        </div>

        <span className="rounded-full bg-green-50 px-5 py-2 text-sm font-black text-green-600">
          {deliveredOrders.length} commande(s)
        </span>
      </div>

      {deliveredOrders.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <History
            size={44}
            className="mx-auto text-green-600"
            strokeWidth={2.5}
          />

          <h2 className="mt-4 text-2xl font-black text-gray-950">
            Aucun historique pour le moment
          </h2>

          <p className="mt-2 text-gray-500">
            Les commandes livrées apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        deliveredOrders.map((order) => {
          const whatsappLink = getWhatsappLink(order);
          const mapsLink = getGoogleMapsLink(order);

          return (
            <article
              key={order.id}
              className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-600">
                      Livrée
                    </span>

                    <span className="rounded-full bg-[#e9fbfc] px-4 py-2 text-xs font-black text-[#1db7bd]">
                      {order.order_reference || "Sans référence"}
                    </span>

                    <span className="rounded-full bg-[#fff9cf] px-4 py-2 text-xs font-black text-[#c7a900]">
                      Livrée le{" "}
                      {formatDate(order.delivered_at || order.created_at)}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-gray-950">
                    Commande de {order.customer_name || "Client"}
                  </h2>

                  <p className="mt-2 text-sm font-bold text-gray-500">
                    Passée le {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="w-full xl:max-w-xs">
                  <KidiclassSelect
                    label="Statut de la commande"
                    value={order.status || "Livrée"}
                    options={statusOptions}
                    onChange={(value) => updateOrderStatus(order.id, value)}
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#1db7bd]">
                    <User size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Client
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.customer_name || "Non renseigné"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#f36f45]">
                    <Phone size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Téléphone
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.customer_phone || "Non renseigné"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#c7a900]">
                    <MapPin size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Livraison
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.delivery_area || "Non renseigné"}
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-500">
                    {order.customer_city || ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fffdf7] p-4">
                  <div className="mb-2 flex items-center gap-2 text-green-600">
                    <Banknote size={18} strokeWidth={2.5} />
                    <span className="text-xs font-black uppercase tracking-wide">
                      Paiement
                    </span>
                  </div>

                  <p className="font-black text-gray-950">
                    {order.payment_method || "Non renseigné"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-[#e9fbfc] p-5">
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-[#1db7bd]">
                  Adresse de livraison
                </p>

                <p className="font-bold leading-7 text-gray-700">
                  {order.customer_address || "Adresse non renseignée"}
                </p>

                {order.delivery_map_address && (
                  <p className="mt-2 text-sm font-bold text-gray-500">
                    Adresse carte : {order.delivery_map_address}
                  </p>
                )}

                {order.delivery_latitude && order.delivery_longitude && (
                  <p className="mt-2 text-sm font-bold text-gray-500">
                    Coordonnées : {order.delivery_latitude},{" "}
                    {order.delivery_longitude}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white hover:bg-green-600"
                    >
                      <MessageCircle size={18} strokeWidth={2.5} />
                      Contacter sur WhatsApp
                    </a>
                  )}

                  {mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white"
                    >
                      <Navigation size={18} strokeWidth={2.5} />
                      Ouvrir Google Maps
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-950">
                  <PackageCheck size={22} strokeWidth={2.5} />
                  Articles commandés
                </h3>

                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-[1.5rem] bg-[#fffdf7] p-4 md:grid-cols-[70px_1fr_auto]"
                    >
                      <div className="overflow-hidden rounded-2xl bg-gray-100">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="h-20 w-full object-cover object-top"
                          />
                        ) : (
                          <div className="h-20 bg-gray-100" />
                        )}
                      </div>

                      <div>
                        <p className="font-black text-gray-950">
                          {item.products?.name || "Produit supprimé"}
                        </p>

                        {item.selected_size && (
                          <p className="mt-1 text-sm font-bold text-gray-500">
                            Taille / pointure : {item.selected_size}
                          </p>
                        )}

                        <p className="mt-1 text-sm font-bold text-gray-500">
                          Quantité : {item.quantity}
                        </p>
                      </div>

                      <p className="font-black text-[#f36f45] md:text-right">
                        {Number(item.unit_price * item.quantity).toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-500">
                      Frais de livraison
                    </p>

                    <p className="font-black text-gray-950">
                      {order.delivery_area === "Abidjan"
                        ? `${Number(order.delivery_fee || 0).toLocaleString(
                            "fr-FR"
                          )} FCFA`
                        : "À confirmer"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-bold text-gray-500">
                      Total commande
                    </p>

                    <p className="text-3xl font-black text-[#f36f45]">
                      {Number(order.total_amount || 0).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
